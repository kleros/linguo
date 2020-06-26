import { eventChannel, channel, END } from 'redux-saga';
import serializerr from 'serializerr';
import { pick, mapValues } from '~/features/shared/fp';

export default function createTransactionChannel(tx, { wait = false } = {}) {
  const resultChannel = channel();

  const txChannel = eventChannel(emit => {
    const confirmations = wait === false ? 0 : wait;
    let txHash = null;

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
      }

      if (number >= confirmations) {
        emit(END);

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
          error: serializerr(error),
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
