import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { actionChannel, call, getContext, put, select } from 'redux-saga/effects';
import deepMerge from 'deepmerge';
import createAsyncAction from '~/shared/createAsyncAction';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { watchAllWithBuffer } from '~/features/web3/runWithContext';
import createSagaApiContext from './createSagaApiContext';

export const fetchByAccount = createAsyncAction('users/settings/fetchByAccount');
export const update = createAsyncAction('users/settings/update');

export const DEFAULT_INITIAL_VALUES = {
  email: '',
  fullName: '',
  emailPreferences: {
    requester: {
      assignment: false,
      delivery: false,
      challenge: false,
      resolution: false,
      ruling: false,
    },
    translator: {
      challenge: false,
      appealFunding: false,
      resolution: false,
      ruling: false,
    },
    challenger: {
      appealFunding: false,
      ruling: false,
    },
  },
};

const INITIAL_ITEM_STATE = {
  loadingState: 'idle',
  error: null,
  token: null,
  data: DEFAULT_INITIAL_VALUES,
};

const userSettingsSlice = createSlice({
  name: 'users/settings',
  initialState: {
    settings: {
      byAccount: {},
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchByAccount.pending.type, (state, action) => {
      const { account } = action.payload;

      if (!state.settings.byAccount[account]) {
        state.settings.byAccount[account] = { ...INITIAL_ITEM_STATE };
      }

      state.settings.byAccount[account].loadingState = 'loading';
      state.settings.byAccount[account].error = null;
    });

    builder.addCase(fetchByAccount.fulfilled.type, (state, action) => {
      const { account, data } = action.payload;

      if (state.settings.byAccount[account]) {
        state.settings.byAccount[account].loadingState = 'idle';
        state.settings.byAccount[account].data = deepMerge(DEFAULT_INITIAL_VALUES, data);
      }
    });

    builder.addCase(fetchByAccount.rejected.type, (state, action) => {
      const { account, error } = action.payload;

      if (state.settings.byAccount[account]) {
        state.settings.byAccount[account].loadingState = 'idle';

        if (error && error.name !== 'CancellationError') {
          state.settings.byAccount[account].error = error;
        }
      }
    });

    builder.addCase(update.pending.type, (state, action) => {
      const { account, ...data } = action.payload;

      if (!state.settings.byAccount[account]) {
        state.settings.byAccount[account] = INITIAL_ITEM_STATE;
      }

      state.settings.byAccount[account].loadingState = 'loading';
      state.settings.byAccount[account].error = null;
      state.settings.byAccount[account].data = deepMerge(DEFAULT_INITIAL_VALUES, data);
    });

    builder.addCase(update.fulfilled.type, (state, action) => {
      const { account, token } = action.payload;

      if (state.settings.byAccount[account]) {
        state.settings.byAccount[account].loadingState = 'idle';
        state.settings.byAccount[account].token = token;
      }
    });

    builder.addCase(update.rejected.type, (state, action) => {
      const { account, error } = action.payload;

      if (state.settings.byAccount[account]) {
        state.settings.byAccount[account].loadingState = 'idle';

        if (error && error.name !== 'CancellationError') {
          state.settings.byAccount[account].error = error;
        }
      }
    });
  },
});

const PERSISTANCE_KEY = 'users';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    storage,
    version: 0,
    blacklist: [],
  };

  return persistReducer(persistConfig, reducer);
}

export default createPersistedReducer(userSettingsSlice.reducer);

export const selectSettings = (state, { account }) =>
  state.users.settings.byAccount[account]?.data ?? DEFAULT_INITIAL_VALUES;

export const selectIsLoadingSettings = (state, { account }) =>
  state.users.settings.byAccount[account]?.loadingState === 'loading';

export const selectError = (state, { account }) => state.users.settings.byAccount[account]?.error ?? null;

export const selectToken = (state, { account }) => state.users.settings.byAccount[account]?.token ?? null;

function* fetchByAccountSaga(action) {
  const usersApi = yield getContext('usersApi');

  const { account } = action.payload;
  const token = yield select(state => selectToken(state, { account }));
  const { meta } = action;

  try {
    const result = yield call([usersApi, 'getSettings'], { account, token });
    yield put(fetchByAccount.fulfilled({ account, data: result.data }, { meta }));
  } catch (err) {
    yield put(fetchByAccount.rejected({ account, error: err }, { meta }));
  }
}

function* updateSaga(action) {
  const usersApi = yield getContext('usersApi');

  const { account, ...data } = action.payload;
  const { meta } = action;

  const token = yield select(state => selectToken(state, { account }));

  try {
    const result = yield call([usersApi, 'updateSettings'], { account, token, data });
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
