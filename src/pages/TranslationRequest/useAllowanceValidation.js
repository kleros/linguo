import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { checkAllowance } from '~/features/tokens/tokensSlice';
import usePreviousMatching from '~/features/shared/usePreviousMatching';

export const AllowanceValidationStatus = {
  idle: 'idle',
  pending: 'pending',
  valid: 'valid',
  invalid: 'invalid',
};

export default function useAllowanceValidation({ spender, shouldSkip }) {
  const dispatch = useDispatch();

  const [status, setStatus] = useState(AllowanceValidationStatus.idle);
  const latestResult = usePreviousMatching(status, previous =>
    [AllowanceValidationStatus.valid, AllowanceValidationStatus.invalid].includes(previous)
  );

  const createValidator = ({ getFieldsValue }) => ({
    validator: async (_, value) => {
      if (!value) {
        setStatus(AllowanceValidationStatus.idle);
        return;
      }

      const { token, account } = getFieldsValue(['token', 'account']);

      if (shouldSkip({ token, account })) {
        setStatus(AllowanceValidationStatus.valid);
        return;
      }

      const checkId = JSON.stringify({
        amount: value,
        tokenAddress: token,
        owner: account,
        spender,
      });

      setStatus(AllowanceValidationStatus.pending);
      await dispatch(
        checkAllowance(
          {
            amount: value,
            tokenAddress: token,
            owner: account,
            spender,
          },
          {
            meta: {
              thunk: { id: checkId },
            },
          }
        )
      )
        .then(() => {
          setStatus(AllowanceValidationStatus.valid);
        })
        .catch(err => {
          setStatus(AllowanceValidationStatus.invalid);
          throw new Error(err.error.message);
        });
    },
  });

  return {
    status,
    latestResult,
    createValidator,
  };
}
