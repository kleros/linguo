import { createSlice } from '@reduxjs/toolkit';
import { persistReducer, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { END } from 'redux-saga';
import { all, call, delay, getContext, put, select, spawn, take } from 'redux-saga/effects';
import { serializeError } from 'serialize-error';
import { pick } from '~/shared/fp';
import { PopupNotificationLevel, notify } from '~/features/ui/popupNotificationsSlice';
import { getErrorMessage } from '~/features/web3';
import { runOnce } from '~/features/web3/runWithContext';
import { getBlockExplorerTxUrl } from '~/features/web3/web3Slice';
import createTransactionChannel from './createTransactionChannel';
import createTtlChannel from './createTtlChannel';
import TransactionState from './TransactionState';

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
    fail(state, action) {
      const { txHash, error } = action.payload;
      if (state.entities[txHash]) {
        state.entities[txHash].txState = TransactionState.Failed;
        state.entities[txHash].error = error;
      }
    },
  },
});

export const { add, remove, setExpiration, confirm, fail } = transactionsSlice.actions;

export default createPersistedReducer(transactionsSlice.reducer);

export const selectAll = state => {
  const { ids, entities } = state.transactions;
  return ids.reduce((acc, txHash) => (entities[txHash] ? acc.concat(entities[txHash]) : acc), []);
};

export const selectExpired = expirationDate => state =>
  selectAll(state).filter(({ expiresAt }) => new Date(expirationDate) >= new Date(expiresAt));

export const selectPending = state => selectAll(state).filter(({ txState }) => txState === TransactionState.Pending);

export const selectByTxHash = txHash => state => state.transactions.entities[txHash];

/**
 * Registers a transaction.
 *
 * @param {PromiEvent} tx the transaction PromiEvent from web3.js
 * @param {object} options the options object
 * @param {false|number} [options.wait=false] if the saga must wait for the transaction to be mined.
 *   If `false`, it will return right after the transaction hash is calculated.
 *   If `0`, it will wait until the transaction is mined.
 *   If `n`, it will wait until `n` confirmations.
 * @param {number} [options.ttl=10] time in milliseconds which the transaction data should be kept in the store.
 * @param {boolean|ShouldNotifyOption} [options.shouldNotify=true] time in milliseconds which the transaction data should be kept
 * @param {function} [options.onSuccess=] a function/generator to be executed if the transaction is sucessfully mined.
 * @param {function} [options.onFailure=] a function/generator to be executed if the transaction fails.
 */
export function* registerTxSaga(
  tx,
  {
    wait = false,
    shouldNotify = true,
    ttl = DEFAULT_TTL,
    onSuccess = function* () {},
    onFailure = function* () {},
  } = {}
) {
  const txChannel = yield call(createTransactionChannel, tx, { wait });

  // Consumes all transaction events in the background
  yield spawn(processTxEventsSaga, txChannel, [
    createStoreUpdateSubscriber(),
    createNoticationSubscriber({ shouldNotify }),
  ]);

  let hasScheduledRemoval = false;
  const hasSpawnCallbacks = false;

  while (true) {
    const result = yield take(txChannel.result);

    if (result === END) {
      break;
    }

    const { txHash } = result.payload ?? {};

    if (!hasSpawnCallbacks && txHash) {
      yield spawn(afterTxResultSaga, txHash, { onSuccess, onFailure });
    }

    if (!hasScheduledRemoval && txHash) {
      const currentDate = yield call(getCurrentDate);
      const expiresAt = new Date(currentDate.getTime() + ttl).toISOString();
      yield put(setExpiration({ expiresAt, txHash }));

      const ttlChannel = yield call(createTtlChannel, ttl, { txHash });
      // Schedules the removal of the transaction in the background
      yield spawn(removeTxAfterTtlSaga, ttlChannel);
      hasScheduledRemoval = true;
    }

    if (result.type === 'FULFILLED') {
      return { txHash };
    }

    if (result.type === 'REJECTED') {
      const { error, txHash } = result.payload;

      throw Object.assign(Object.create(Error.prototype), {
        ...serializeError(error),
        context: { txHash },
      });
    }
  }
}

function* afterTxResultSaga(txHash, { onSuccess = function* () {}, onFailure = function* () {} }) {
  const matchesActionType = action => [confirm, fail].some(({ match }) => match(action));
  const matchesTxHash = action => action.payload?.txHash === txHash;

  const resultAction = yield take(action => matchesActionType(action) && matchesTxHash(action));

  if (confirm.match(resultAction)) {
    yield call(onSuccess, resultAction);
  } else {
    yield call(onFailure, resultAction);
  }
}

/**
 * This saga will run only after `redux-persist` REHYDRATE action, which means there
 * was a page refresh or the app tab was open again after being closed.
 */
export function* removeAllExpiredTxsSaga() {
  while (true) {
    const { key } = yield take(REHYDRATE);
    if (key === PERSISTANCE_KEY) {
      const currentDate = yield call(getCurrentDate);
      const expiredTxs = yield select(selectExpired(currentDate.toISOString()));
      yield all(expiredTxs.map(({ txHash }) => put(remove({ txHash }))));
    }
  }
}

export function* updateAllPendingTxsSaga() {
  const web3 = yield getContext('library');

  const pendingTxs = yield select(selectPending);

  yield all(pendingTxs.map(tx => call(updatePendingTxSaga, { web3, txHash: tx.txHash })));
}

function* updatePendingTxSaga({ web3, txHash }) {
  const MAX_ATTEMPTS = 10;
  const INTERVAL = 10000;

  const _1_HOUR_SECONDS = 3600;
  const _10_SECONDS = 10;

  let attempts = 0;
  let data = null;

  yield call(
    createTxNotification,
    { txHash },
    {
      level: PopupNotificationLevel.info,
      message: 'Transaction pending!',
      duration: _1_HOUR_SECONDS,
    }
  );

  do {
    data = yield call([web3.eth, web3.eth.getTransactionReceipt], txHash);
    attempts += 1;
    // Tx is still pending
    if (data === null) {
      yield delay(INTERVAL);
    }
  } while (data === null && attempts < MAX_ATTEMPTS);

  if (data === null) {
    return;
  }

  if (data.status === true) {
    // Tx was mined sucessfully
    yield put(
      confirm({
        txHash,
        number: 0,
        receipt: pick(['from', 'to', 'transactionIndex', 'blockHash', 'blockNumber'], data),
      })
    );

    yield call(
      createTxNotification,
      { txHash },
      {
        level: PopupNotificationLevel.success,
        message: 'Transaction mined!',
        duration: _10_SECONDS,
      }
    );
  } else {
    // Tx onFailure
    yield put(
      fail({
        txHash,
        error: { message: 'Transaction failed with unknown reason.' },
      })
    );

    yield call(
      createTxNotification,
      { txHash },
      {
        level: PopupNotificationLevel.error,
        message: 'Transaction failed!',
        duration: _10_SECONDS,
      }
    );
  }
}

export const sagas = {
  removeAllExpiredTxsSaga,
  updateAllPendingTxsSaga: runOnce(updateAllPendingTxsSaga),
};

function getCurrentDate() {
  return new Date();
}

function* removeTxAfterTtlSaga(ttlChannel) {
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
        yield put(fail(event.payload));
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

    const _1_HOUR_SECONDS = 3600;
    const _10_SECONDS = 10;

    switch (event.type) {
      case 'TX_HASH':
        if (shouldNotify.pending) {
          yield call(
            createTxNotification,
            { txHash },
            {
              level: PopupNotificationLevel.info,
              duration: _1_HOUR_SECONDS,
              message: 'Transaction pending!',
            }
          );
        }

        break;
      case 'TX_CONFIRMATION':
        if (shouldNotify.success) {
          yield call(
            createTxNotification,
            { txHash },
            {
              level: PopupNotificationLevel.success,
              message: 'Transaction mined!',
              duration: _10_SECONDS,
            }
          );
        }

        break;

      case 'TX_ERROR':
        if (shouldNotify.failure) {
          yield call(
            createTxNotification,
            { txHash },
            {
              level: PopupNotificationLevel.error,
              message: getErrorMessage(event.payload.error ?? 'Unknown error'),
              duration: _10_SECONDS,
            }
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

function* createTxNotification(
  { txHash },
  { level = PopupNotificationLevel.info, key = `tx/${txHash}`, ...rest } = {}
) {
  const url = txHash ? yield call(getBlockExplorerTxUrl, txHash) : null;
  const notificationTemplateMixin = url
    ? {
        template: {
          id: 'link',
          params: {
            text: 'View on Block Explorer',
            url,
          },
        },
      }
    : {};

  yield put(
    notify({
      key,
      level,
      ...rest,
      ...notificationTemplateMixin,
    })
  );
}

/**
 * @typedef {object} ShouldNotifyOption
 * @prop {boolean} [pending=true] whether it should notify on pending.
 * @prop {boolean} [success=true] whether it should notify on sucess.
 * @prop {boolean} [failure=true] whether it should notify on failure.
 */
