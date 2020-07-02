import { eventChannel, channel, END } from 'redux-saga';
import { serializeError } from 'serialize-error';
import { pick, mapValues } from '~/features/shared/fp';

export default function createTransactionChannel(tx, { wait = false } = {}) {
  const resultChannel = channel();

  const txChannel = eventChannel(emit => {
    const confirmations = wait === false ? 0 : wait;
    let txHash = null;
    let emittedConfirmation = false;

    tx.once('transactionHash', _txHash => {
      console.debug('Tx channel: transaction hash', _txHash);
      emit({ type: 'TX_HASH', payload: { txHash: _txHash } });
      txHash = _txHash;

      if (wait === false) {
        resultChannel.put({ type: 'FULFILLED', payload: { txHash } });
        resultChannel.put(END);
      } else {
        resultChannel.put({ type: 'PENDING', payload: { txHash } });
      }
    });

    tx.on('confirmation', (number, receipt) => {
      console.debug('Tx channel: transaction confirmation #', number);
      if (number <= confirmations) {
        emit({
          type: 'TX_CONFIRMATION',
          payload: {
            txHash,
            number,
            receipt: {
              ...pick(['from', 'to', 'transactionIndex', 'blockHash', 'blockNumber'], receipt),
              events: extractEventsReturnValues(receipt.events),
            },
          },
        });

        emittedConfirmation = true;
      }

      if (number >= confirmations) {
        emit(END);

        /**
         * For some reason, on Kovan sometimes the confirmation #0 is not emitted,
         * the first one to happen is confirmation #1.
         * In such cases, we still want to emit the TX_CONFIRMATION event to update
         * the state of the transaction accordingly even if `confirmations` is 0.
         */
        if (!emittedConfirmation) {
          emit({
            type: 'TX_CONFIRMATION',
            payload: {
              txHash,
              number,
              receipt: {
                ...pick(['from', 'to', 'transactionIndex', 'blockHash', 'blockNumber'], receipt),
                events: extractEventsReturnValues(receipt.events),
              },
            },
          });
        }

        resultChannel.put({ type: 'FULFILLED', payload: { txHash } });
        resultChannel.put(END);
      }
    });

    tx.on('error', error => {
      console.debug('Tx channel: transaction error', error);
      emit({ type: 'TX_ERROR', payload: { txHash, error } });
      emit(END);

      resultChannel.put({
        type: 'REJECTED',
        payload: {
          txHash,
          error: serializeError(error),
        },
      });
      resultChannel.put(END);
    });

    return () => {
      tx.off('confirmation');
      tx.off('error');
    };
  });

  return Object.assign(txChannel, { result: resultChannel });
}

const extractEventsReturnValues = mapValues(({ returnValues }) =>
  Object.entries(returnValues).reduce((acc, [key, value]) => {
    // Ignore numeric keys
    if (!Number.isNaN(Number(key))) {
      return acc;
    }

    return Object.assign(acc, { [key]: value });
  }, {})
);
