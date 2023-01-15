import { useState } from 'react';

const TRANSACTION_REJECTED_CODE = 4001;
const TRANSACTION_REJECTED = 'Transaction rejected by user';

export const STATE = {
  DEFAULT: 'idle',
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
};
// const REJECTED = 'rejected';

export const useTransactionState = contractCallbackFn => {
  const [state, setState] = useState(STATE.DEFAULT);
  const [message, setMessage] = useState('');

  const handleTransaction = async () => {
    if (!contractCallbackFn) return;

    setState(STATE.PENDING);

    try {
      const tx = await contractCallbackFn();
      await tx.wait();
      setState(STATE.SUCCESS);
    } catch (error) {
      if (error.code === TRANSACTION_REJECTED_CODE) {
        setMessage(TRANSACTION_REJECTED);
        // setState(REJECTED);
        setState(STATE.DEFAULT);
      } else {
        console.error(error);
        setState(STATE.ERROR);
      }
    }
  };

  /* useEffect(() => {
            if (state === 'rejected') toast.error(message);
            reset();
          }, [message, state]);
         */

  return {
    state,
    message,
    handleTransaction,
  };
};
