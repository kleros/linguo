import { createReducer, createAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
import { put } from 'redux-saga/effects';
import getErrorMessage from '~/adapters/web3React/getErrorMessage';
import createStateMachineReducer from '~/features/shared/createStateMachineReducer';
import { notify, NotificationLevel } from '~/features/ui/notificationSlice';
import createWatchSaga from '~/features/shared/createWatchSaga';

export const activate = Object.assign(createAction(`web3/activate`), {
  start: createAction(`web3/activate/start`),
  success: createAction(`web3/activate/success`),
  error: createAction(`web3/activate/error`, errorPayloadCreator),
});

export const deactivate = createAction(`web3/deactivate`);

export const changeAccount = createAction(`web3/changeAccount`);

export const changeChainId = createAction(`web3/changeChainId`);

export const setError = createAction(`web3/setError`, errorPayloadCreator);

export const changeLibrary = createAction(`web3/changeLibrary`);

export const selectState = state => state.web3.state;

export const selectIsConnecting = state => selectState(state) === 'connecting';

export const selectIsConnected = state => selectState(state) === 'connected';

export const selectIsIdle = state => selectState(state) === 'idle';

export const selectIsErrored = state => selectState(state) === 'errored';

export const selectCurrentConnector = state => state.web3.context.currentConnector;

export const selectActivatingConnector = state => state.web3.context.activatingConnector;

export const selectAccount = state => state.web3.context.account;

export const selectChainId = state => state.web3.context.chainId;

export const selectError = state => state.web3.context.error;

export const selectHasError = state => selectError(state) !== null;

export function* notifyErrorSaga(action) {
  const { error } = action.payload;
  if (!error) {
    return;
  }

  yield put(
    notify({
      key: 'web3/error',
      level: NotificationLevel.error,
      message: getErrorMessage(error),
      duration: 5,
    })
  );
}

export const sagas = {
  watchNotifyError: createWatchSaga(notifyErrorSaga, setError),
  watchNotifyActivateError: createWatchSaga(notifyErrorSaga, activate.error),
};

const reducer = createFinalReducer();
export default reducer;

function createFinalReducer() {
  const guards = {
    hasError({ action }) {
      const hasError = !!action.payload?.error;
      return hasError;
    },
    hasNoError({ action }) {
      const hasError = !!action.payload?.error;
      return !hasError;
    },
    hasNoConnectorAndNoError({ context, action }) {
      const hasConnector = context.currentConnector;
      const hasError = !!action.payload?.error;
      return !hasConnector && !hasError;
    },
    hasConnectorAndNoError({ context, action }) {
      const hasConnector = context.currentConnector;
      const hasError = !!action.payload?.error;
      return hasConnector && !hasError;
    },
  };

  const web3StateMachine = {
    name: 'web3',
    initial: 'idle',
    context: {
      currentConnector: null,
      activatingConnector: null,
      error: null,
      account: null,
      chainId: -1,
    },
    states: {
      idle: {
        on: {
          [activate.start]: 'connecting',
        },
      },
      connecting: {
        on: {
          [activate.error]: 'errored',
          [deactivate]: 'idle',
          [activate.success]: 'connected',
          [changeAccount]: 'connecting',
          [changeChainId]: 'connecting',
        },
      },
      connected: {
        on: {
          [activate.start]: 'connecting',
          [deactivate]: 'idle',
          [changeAccount]: 'connected',
          [changeChainId]: 'connected',
          [setError]: [
            {
              target: 'errored',
              guard: guards.hasError,
            },
            {
              target: 'connected',
              guard: guards.hasNoError,
            },
          ],
        },
      },
      errored: {
        on: {
          [activate.start]: 'connecting',
          [deactivate]: 'idle',
          [changeAccount]: 'errored',
          [changeChainId]: 'errored',
          [setError]: [
            {
              target: 'errored',
              guard: guards.hasError,
            },
            {
              target: 'idle',
              guard: guards.hasNoConnectorAndNoError,
            },
            {
              target: 'connected',
              guard: guards.hasConnectorAndNoError,
            },
          ],
        },
      },
    },
  };

  const createContextReducer = initialState =>
    createReducer(initialState, {
      [activate.start]: (state, action) => {
        state.activatingConnector = action.payload.name;
      },
      [activate.success]: (state, action) => {
        state.activatingConnector = null;
        state.currentConnector = action.payload.name;
        state.error = null;
      },
      [activate.error]: (state, action) => {
        state.currentConnector = null;
        state.activatingConnector = null;
        state.error = action.payload.error;
      },
      [deactivate]: () => initialState,
      [changeAccount]: (state, action) => {
        state.account = action.payload?.account ?? initialState.account;
      },
      [changeChainId]: (state, action) => {
        state.chainId = action.payload?.chainId ?? initialState.chainId;
      },
      [setError]: (state, action) => {
        state.error = action.payload?.error ?? initialState.error;
      },
    });

  const persistConfig = {
    key: 'web3',
    storage,
    stateReconciler: hardSet,
  };

  return persistReducer(persistConfig, createStateMachineReducer(web3StateMachine, createContextReducer));
}

function errorPayloadCreator(payload) {
  const { error } = payload ?? {};
  if (error) {
    const { message, name, code } = error;

    return {
      payload: {
        ...payload,
        error: {
          message,
          name,
          code,
        },
      },
      error: true,
    };
  }

  return { payload };
}
