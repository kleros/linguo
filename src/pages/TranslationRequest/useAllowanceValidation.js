import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { checkAllowanceChannel, checkAllowance } from '~/features/tokens/tokensSlice';
import useLatestMatching from '~/features/shared/useLatestMatching';

export default function useAllowanceValidation({ spender, shouldSkip }) {
  const dispatch = useDispatch();

  const [status, setStatus] = useState('idle');
  const latestResult = useLatestMatching(status, previous => ['valid', 'invalid'].includes(previous));

  const createValidator = ({ getFieldsValue }) => ({
    validator: async (_, value) => {
      if (!value) {
        setStatus('idle');
        return;
      }

      const { token, account } = getFieldsValue(['token', 'account']);

      if (shouldSkip({ token, account })) {
        setStatus('valid');
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

      setStatus('pending');
      try {
        await getCheckAllowanceResponse();
        setStatus('valid');
      } catch (err) {
        setStatus('invalid');
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
