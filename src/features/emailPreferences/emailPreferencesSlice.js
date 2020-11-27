import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { actionChannel, call, getContext, put, select } from 'redux-saga/effects';
import createAsyncAction from '~/shared/createAsyncAction';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { watchAllWithBuffer } from '~/features/web3/runWithContext';
import createSagaApiContext from './createSagaApiContext';

export const fetchByAccount = createAsyncAction('emailPrefrences/fetchByAccount');
export const update = createAsyncAction('emailPrefrences/update');

const INITIAL_ITEM_STATE = {
  loadingState: 'idle',
  error: null,
  token: null,
  data: undefined,
};

const emailPreferencesSlice = createSlice({
  name: 'emailPreferences',
  initialState: {
    byAccount: {},
  },
  extraReducers: builder => {
    builder.addCase(fetchByAccount.pending.type, (state, action) => {
      const { account } = action.payload;

      if (!state.byAccount[account]) {
        state.byAccount[account] = INITIAL_ITEM_STATE;
      }

      state.byAccount[account].loadingState = 'loading';
      state.byAccount[account].error = null;
    });

    builder.addCase(fetchByAccount.fulfilled.type, (state, action) => {
      const { account, data } = action.payload;

      if (state.byAccount[account]) {
        state.byAccount[account].loadingState = 'idle';
        state.byAccount[account].data = data;
      }
    });

    builder.addCase(fetchByAccount.rejected.type, (state, action) => {
      const { account, error } = action.payload;

      if (state.byAccount[account]) {
        state.byAccount[account].loadingState = 'idle';

        if (error && error.name !== 'CancellationError') {
          state.byAccount[account].error = error;
        }
      }
    });

    builder.addCase(update.pending.type, (state, action) => {
      const { account, ...data } = action.payload;

      if (!state.byAccount[account]) {
        state.byAccount[account] = INITIAL_ITEM_STATE;
      }

      state.byAccount[account].loadingState = 'loading';
      state.byAccount[account].error = null;
      state.byAccount[account].data = data;
    });

    builder.addCase(update.fulfilled.type, (state, action) => {
      const { account, token } = action.payload;

      if (state.byAccount[account]) {
        state.byAccount[account].loadingState = 'idle';
        state.byAccount[account].token = token;
      }
    });

    builder.addCase(update.rejected.type, (state, action) => {
      const { account, error } = action.payload;

      if (state.byAccount[account]) {
        state.byAccount[account].loadingState = 'idle';

        if (error && error.name !== 'CancellationError') {
          state.byAccount[account].error = error;
        }
      }
    });
  },
});

const PERSISTANCE_KEY = 'emailPreferences';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    storage,
    version: 0,
    blacklist: [],
  };

  return persistReducer(persistConfig, reducer);
}

export default createPersistedReducer(emailPreferencesSlice.reducer);

export const selectPreferences = (state, { account }) => state.emailPreferences.byAccount[account]?.data;

export const selectIsLoadingPreferences = (state, { account }) =>
  state.emailPreferences.byAccount[account]?.loadingState === 'loading';

export const selectError = (state, { account }) => state.emailPreferences.byAccount[account]?.error ?? null;

export const selectToken = (state, { account }) => state.emailPreferences.byAccount[account]?.token ?? null;

function* fetchByAccountSaga(action) {
  const emailPreferencesApi = yield getContext('emailPreferencesApi');

  const { account } = action.payload;
  const token = yield select(state => selectToken(state, { account }));
  const { meta } = action;

  try {
    const result = yield call([emailPreferencesApi, 'get'], { account, token });
    yield put(fetchByAccount.fulfilled({ account, data: result.data }, { meta }));
  } catch (err) {
    yield put(fetchByAccount.rejected({ account, error: err }, { meta }));
  }
}

function* updateSaga(action) {
  const emailPreferencesApi = yield getContext('emailPreferencesApi');

  const { account, email, fullName, preferences } = action.payload;
  const token = yield select(state => selectToken(state, { account }));
  const { meta } = action;

  const payload = { email, fullName, preferences };

  try {
    const result = yield call([emailPreferencesApi, 'update'], { account, token, payload });
    yield put(update.fulfilled({ account, data: result.data, token: result.token }, { meta }));
  } catch (err) {
    yield put(update.rejected({ account, error: err }, { meta }));
  }
}

const createWatchUpdateSaga = createWatcherSaga(
  {
    takeType: TakeType.latestByKey,
    selector: action => action.payload?.account,
  },
  updateSaga
);

const createWatchFetchByAccountSaga = createWatcherSaga(
  {
    takeType: TakeType.latestByKey,
    selector: action => action.payload?.account,
  },
  fetchByAccountSaga
);

export const sagas = {
  mainTasksSaga: watchAllWithBuffer(
    [
      [createWatchUpdateSaga, actionChannel(update.type)],
      [createWatchFetchByAccountSaga, actionChannel(fetchByAccount.type)],
    ],
    {
      createContext: createSagaApiContext,
    }
  ),
};
