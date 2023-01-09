import { useState } from 'react';

const TRANSACTION_REJECTED_CODE = 4001;
const TRANSACTION_REJECTED = 'Transaction rejected by user';
const SUCCESS = 'success';
// const REJECTED = 'Rejected';
const PENDING = 'pending';
const ERROR = 'error';
const DEFAULT = 'idle';

export const useTransactionState = contractCallbackFn => {
  const [state, setState] = useState(DEFAULT);
  const [message, setMessage] = useState('');

  const handleTransaction = async () => {
    if (!contractCallbackFn) return;

    setState(PENDING);

    try {
      const tx = await contractCallbackFn();
      await tx.wait();
      setState(SUCCESS);
    } catch (error) {
      if (error.code === TRANSACTION_REJECTED_CODE) {
        setMessage(TRANSACTION_REJECTED);
        // setState(REJECTED);
        setState(DEFAULT);
      } else {
        console.error(error);
        setState(ERROR);
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
