import { createSlice } from '@reduxjs/toolkit';
import { persistReducer, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { END } from 'redux-saga';
import { take, call, put, select, all, spawn } from 'redux-saga/effects';
import serializerr from 'serializerr';
import { notify, NotificationLevel } from '~/features/ui/notificationSlice';
import { getErrorMessage } from '~/features/web3';
import { getBlockExplorerTxUrl } from '~/features/web3/web3Slice';
import TransactionState from './TransactionState';
import createTransactionChannel from './createTransactionChannel';
import createTtlChannel from './createTtlChannel';

const _30_MINUTES_MS = 30 * 60 * 1000;
const DEFAULT_TTL = _30_MINUTES_MS;

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
        txState = TransactionState.Pending,
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
        state.entities[txHash].txState = TransactionState.Mined;
        state.entities[txHash].confirmations = number;
        state.entities[txHash].receipt = receipt;
      }
    },
    setError(state, action) {
      const { txHash, error } = action.payload;
      if (state.entities[txHash]) {
        state.entities[txHash].txState = TransactionState.Failed;
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

export const selectByTxHash = txHash => state => state.transactions.entities[txHash];
/**
 * Registers a transaction.
 *
 * @typedef {object} ShouldNotifyOption
 * @prop {boolean} [pending=true] whether it should notify on pending.
 * @prop {boolean} [success=true] whether it should notify on sucess.
 * @prop {boolean} [failure=true] whether it should notify on failure.
 *
 * @param {PromiEvent} tx the transaction PromiEvent from web3.js
 * @param {object} options the options object
 * @param {false|number} [options.wait=false] if the saga must wait for the transaction to be mined.
 * If `false`, it will return right after the transaction hash is calculated.
 * If `0`, it will wait until the transaction is mined.
 * If `n`, it will wait until `n` confirmations.
 * @param {number} [options.ttl=10] time in milliseconds which the transaction data should be kept
 * in the store.
 * @param {boolean|ShouldNotifyOption} [options.shouldNotify=true] time in milliseconds which the transaction data should be kept
 */
export function* registerTxSaga(tx, { wait = false, ttl = DEFAULT_TTL, shouldNotify = true } = {}) {
  const txChannel = yield call(createTransactionChannel, tx, { wait });

  // Consumes all transaction events in the background
  yield spawn(processTxEventsSaga, txChannel, [
    createStoreUpdateSubscriber(),
    createNoticationSubscriber({ shouldNotify }),
  ]);

  let hasScheduledRemoval = false;

  while (true) {
    const result = yield take(txChannel.result);

    if (result === END) {
      break;
    }

    const { txHash } = result.payload ?? {};

    if (!hasScheduledRemoval && txHash) {
      const currentDate = yield call(getCurrentDate);
      const expiresAt = new Date(currentDate.getTime() + ttl).toISOString();
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
      const currentDate = yield call(getCurrentDate);
      const expiredTxs = yield select(selectExpired(currentDate.toISOString()));
      yield all(expiredTxs.map(({ txHash }) => put(remove({ txHash }))));
    }
  }
}

export const sagas = {
  removeExpiredTxsSaga,
};

function getCurrentDate() {
  return new Date();
}

function* removeTxAfterTtl(ttlChannel) {
  const { txHash } = yield take(ttlChannel);
  yield put(remove({ txHash }));
}

function* processTxEventsSaga(txChannel, subscribers = []) {
  while (true) {
    const event = yield take(txChannel);

    if (event === END) {
      break;
    }

    yield all(subscribers.map(subscriber => call(subscriber, event)));
  }
}

function createStoreUpdateSubscriber() {
  return function* storeUpdateSubscriber(event) {
    switch (event.type) {
      case 'TX_HASH':
        yield put(add(event.payload));
        break;
      case 'TX_CONFIRMATION':
        yield put(confirm(event.payload));
        break;
      case 'TX_ERROR':
        yield put(setError(event.payload));
        break;
    }
  };
}

function createNoticationSubscriber({ shouldNotify }) {
  shouldNotify = normalizeShouldNotify(shouldNotify);

  return function* notificationSubscriber(event) {
    if (!shouldNotify) {
      return;
    }

    const txHash = event.payload?.txHash ?? null;
    const url = txHash ? yield call(getBlockExplorerTxUrl, txHash) : null;
    const notificationTemplateMixin = url
      ? {
          template: {
            id: 'link',
            params: {
              text: 'View on Etherscan',
              url,
            },
          },
        }
      : {};

    const _1_HOUR_SECONDS = 3600;
    const _5_SECONDS = 5;

    switch (event.type) {
      case 'TX_HASH':
        if (shouldNotify.pending) {
          yield put(
            notify({
              key: `tx/${txHash}`,
              level: NotificationLevel.info,
              duration: _1_HOUR_SECONDS,
              message: 'Transaction pending!',
              ...notificationTemplateMixin,
            })
          );
        }

        break;
      case 'TX_CONFIRMATION':
        if (shouldNotify.success) {
          yield put(
            notify({
              key: `tx/${txHash}`,
              level: NotificationLevel.success,
              message: 'Transaction mined!',
              duration: _5_SECONDS,
              ...notificationTemplateMixin,
            })
          );
        }

        break;

      case 'TX_ERROR':
        if (shouldNotify.failure) {
          yield put(
            notify({
              key: `tx/${txHash}`,
              level: NotificationLevel.error,
              message: getErrorMessage(event.payload.error ?? 'Unknown error'),
              ...notificationTemplateMixin,
            })
          );
        }

        break;
    }
  };
}

function normalizeShouldNotify(shouldNotify) {
  if (typeof shouldNotify === 'boolean') {
    return {
      pending: shouldNotify,
      failure: shouldNotify,
      success: shouldNotify,
    };
  }

  return shouldNotify;
}
