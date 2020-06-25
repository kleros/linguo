import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { checkAllowanceChannel, checkAllowance } from '~/features/tokens/tokensSlice';
import usePreviousMatching from '~/features/shared/usePreviousMatching';

export const AllowanceValidationStatus = {
  Idle: 'idle',
  Pending: 'pending',
  Valid: 'valid',
  Invalid: 'invalid',
};

export default function useAllowanceValidation({ spender, shouldSkip }) {
  const dispatch = useDispatch();

  const [status, setStatus] = useState(AllowanceValidationStatus.Idle);
  const latestResult = usePreviousMatching(status, previous =>
    [AllowanceValidationStatus.Valid, AllowanceValidationStatus.Invalid].includes(previous)
  );

  const createValidator = ({ getFieldsValue }) => ({
    validator: async (_, value) => {
      if (!value) {
        setStatus(AllowanceValidationStatus.Idle);
        return;
      }

      const { token, account } = getFieldsValue(['token', 'account']);

      if (shouldSkip({ token, account })) {
        setStatus(AllowanceValidationStatus.Valid);
        return;
      }

      dispatch(
        checkAllowance({
          amount: value,
          tokenAddress: token,
          owner: account,
          spender,
        })
      );

      setStatus(AllowanceValidationStatus.Pending);
      try {
        await getCheckAllowanceResponse();
        setStatus(AllowanceValidationStatus.Valid);
      } catch (err) {
        setStatus(AllowanceValidationStatus.Invalid);
        throw err;
      }
    },
  });

  return {
    status,
    latestResult,
    createValidator,
  };
}

function getCheckAllowanceResponse() {
  let res;
  let rej;

  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  checkAllowanceChannel.take(
    action => {
      if (checkAllowance.fulfilled.match(action)) {
        return res();
      }

      if (checkAllowance.rejected.match(action)) {
        const message = action.payload?.error?.message ?? 'Unknown error.';
        return rej(new Error(message));
      }
    },
    action => checkAllowance.fulfilled.match(action) || checkAllowance.rejected.match(action)
  );

  return promise;
}
