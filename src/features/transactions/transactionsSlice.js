import { createSlice } from '@reduxjs/toolkit';
import { persistReducer, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { eventChannel, channel, END } from 'redux-saga';
import { take, call, put, select, all, spawn } from 'redux-saga/effects';
import serializerr from 'serializerr';
import { pick, mapValues } from '~/features/shared/fp';

const _30_MINUTES_MS = 30 * 60 * 1000;
const DEFAULT_TTL = 30000;

const PERSISTANCE_KEY = 'transactions';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    storage,
  };

  return persistReducer(persistConfig, reducer);
}

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    entities: {},
    ids: [],
  },
  reducers: {
    add(state, action) {
      const {
        txHash,
        txState = 'sent',
        expiresAt = null,
        receipt = null,
        confirmations = 0,
        error = null,
        ...rest
      } = action.payload;

      state.ids.push(txHash);
      state.entities[txHash] = {
        txHash,
        txState,
        expiresAt,
        receipt,
        confirmations,
        error,
        ...rest,
      };
    },
    remove(state, action) {
      const { txHash } = action.payload;

      state.ids = state.ids.filter(item => item !== txHash);
      delete state.entities[txHash];
    },
    removeExpired(state, action) {
      const { expirationDate } = action.payload;

      const idsToRemove = [];

      state.ids.forEach(txHash => {
        const tx = state.entities[txHash];

        if (new Date(tx.expiresAt ?? null) < new Date(expirationDate)) {
          idsToRemove.push(tx.txHash);
          delete state.entities[tx.txHash];
        }
      });

      state.ids = state.ids.filter(item => !idsToRemove.includes(item));
    },
    setExpiration(state, action) {
      const { txHash, expiresAt } = action.payload;
      if (state.entities[txHash]) {
        state.entities[txHash].expiresAt = expiresAt;
      }
    },
    confirm(state, action) {
      const { txHash, number, receipt } = action.payload;
      if (state.entities[txHash]) {
        state.entities[txHash].txState = 'mined';
        state.entities[txHash].confirmations = number;
        state.entities[txHash].receipt = receipt;
      }
    },
    setError(state, action) {
      const { txHash, error } = action.payload;
      if (state.entities[txHash]) {
        state.entities[txHash].txState = 'failed';
        state.entities[txHash].error = error;
      }
    },
  },
});

export const { add, remove, removeExpired, setExpiration, confirm, setError } = transactionsSlice.actions;

export default createPersistedReducer(transactionsSlice.reducer);

export const selectAll = state => {
  const { ids, entities } = state.transactions;
  return ids.reduce((acc, txHash) => (entities[txHash] ? acc.concat(entities[txHash]) : acc), []);
};

export const selectExpired = expirationDate => state =>
  selectAll(state).filter(({ expiresAt }) => new Date(expirationDate) >= new Date(expiresAt));

/**
 * Registers a transaction.
 *
 * @param {PromiEvent} tx the transaction PromiEvent from web3.js
 * @param {object} options the options object
 * @param {false|number} options.wait if the saga must wait for the transaction to be mined.
 * If `false`, it will return right after the transaction hash is calculated.
 * If `0`, it will wait until the transaction is mined.
 * If `n`, it will wait until `n` confirmations.
 * @param {number} options.ttl time in milliseconds which the transaction data should be kept
 * in the store.
 */
export function* registerTxSaga(tx, { wait = false, ttl = DEFAULT_TTL } = {}) {
  const txChannel = yield call(createTxChannel, tx, { wait });

  // Consumes all transaction events in the background
  yield spawn(processTxEventsSaga, txChannel);

  let hasScheduledRemoval = false;

  while (true) {
    const result = yield take(txChannel.result);

    if (result === END) {
      break;
    }

    const { txHash } = result.payload ?? {};
    if (!hasScheduledRemoval && txHash) {
      const expiresAt = new Date(Date.now() + ttl).toISOString();
      yield put(setExpiration({ expiresAt, txHash }));

      const ttlChannel = yield call(createTtlChannel, ttl, { txHash });
      // Schedules the removal of the transaction in the background
      yield spawn(removeTxAfterTtl, ttlChannel);
      hasScheduledRemoval = true;
    }

    if (result.type === 'FULFILLED') {
      return { txHash };
    }

    if (result.type === 'REJECTED') {
      const { error, txHash } = result.payload;
      throw Object.assign(Object.create(Error.prototype), {
        ...serializerr(error),
        context: { txHash },
      });
    }
  }
}

export function* removeExpiredTxsSaga() {
  while (true) {
    const { key } = yield take(REHYDRATE);
    if (key === PERSISTANCE_KEY) {
      const expiredTxs = yield select(selectExpired(new Date().toISOString()));
      for (let i = 0; i < expiredTxs.length; i++) {
        const txHash = expiredTxs[i].txHash;
        yield put(remove({ txHash }));
      }
    }
  }
}

export const sagas = {
  removeExpiredTxsSaga,
};

const createTxChannel = (tx, { wait = false } = {}) => {
  const resultChannel = channel();

  const txChannel = eventChannel(emit => {
    const confirmations = wait === false ? 0 : wait;
    let txHash = null;

    tx.once('transactionHash', _txHash => {
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
      if (number <= confirmations) {
        emit({
          type: 'CONFIRMATION',
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
      emit({ type: 'ERROR', payload: { txHash, error } });
      emit(END);

      resultChannel.put({ type: 'REJECTED', payload: { txHash, error } });
      resultChannel.put(END);
    });

    return () => {
      tx.off('confirmation');
      tx.off('error');
    };
  });

  return Object.assign(txChannel, { result: resultChannel });
};

function* processTxEventsSaga(txChannel) {
  while (true) {
    const event = yield take(txChannel);

    if (event === END) {
      break;
    }

    switch (event.type) {
      case 'TX_HASH':
        yield put(add(event.payload));
        break;
      case 'CONFIRMATION':
        yield put(confirm(event.payload));
        break;
      case 'ERROR':
        if (event.payload.txHash) {
          yield put(setError(event.payload));
        }
        break;
    }
  }
}

const createTtlChannel = (ttl, { txHash }) =>
  eventChannel(emit => {
    const handler = setTimeout(emit, ttl, { txHash });

    return () => clearTimeout(handler);
  });

function* removeTxAfterTtl(ttlChannel) {
  const { txHash } = yield take(ttlChannel);
  yield put(remove({ txHash }));
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
