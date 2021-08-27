// TODO: remove the comment below once the notifications settings are fixed.
/* eslint-disable no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { actionChannel, call, getContext, put, putResolve, select } from 'redux-saga/effects';
import deepMerge from 'deepmerge';
import createAsyncAction from '~/shared/createAsyncAction';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { watchAllWithBuffer } from '~/features/web3/runWithContext';
import createSagaApiContext from './createSagaApiContext';

export const fetchByAccount = createAsyncAction('users/settings/fetchByAccount');
export const update = createAsyncAction('users/settings/update');
export const generateToken = createAsyncAction('users/settings/generateToken');

export const DEFAULT_SETTINGS = {
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
  data: DEFAULT_SETTINGS,
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
        state.settings.byAccount[account] = deepMerge({}, INITIAL_ITEM_STATE);
      }

      state.settings.byAccount[account].loadingState = 'loading';
      state.settings.byAccount[account].error = null;
    });

    builder.addCase(fetchByAccount.fulfilled.type, (state, action) => {
      const { account, data } = action.payload;

      if (state.settings.byAccount[account]) {
        state.settings.byAccount[account].loadingState = 'idle';
        state.settings.byAccount[account].data = deepMerge(DEFAULT_SETTINGS, data);
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
      state.settings.byAccount[account].data = deepMerge(DEFAULT_SETTINGS, data);
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

    builder.addCase(generateToken.fulfilled.type, (state, action) => {
      const { account, token } = action.payload;

      if (!state.settings.byAccount[account]) {
        state.settings.byAccount[account] = INITIAL_ITEM_STATE;
      }

      state.settings.byAccount[account].token = token;
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

export const selectSettings = (state, { account }) => state.users.settings.byAccount[account]?.data ?? DEFAULT_SETTINGS;

export const selectIsLoadingSettings = (state, { account }) =>
  state.users.settings.byAccount[account]?.loadingState === 'loading';

export const selectError = (state, { account }) => state.users.settings.byAccount[account]?.error ?? null;

export const selectToken = (state, { account }) => state.users.settings.byAccount[account]?.token ?? null;

function* generateTokenSaga(action) {
  const usersApi = yield getContext('usersApi');

  const { account } = action.payload;
  const { meta } = action;

  try {
    const token = yield call([usersApi, 'generateToken'], { account });
    yield put(generateToken.fulfilled({ account, token }, { meta }));
  } catch (err) {
    yield put(generateToken.rejected({ account, error: err }, { meta }));
  }
}

function* fetchByAccountSaga(action) {
  const usersApi = yield getContext('usersApi');

  const account = action.payload?.account ?? null;
  const thunk = action.meta?.thunk ?? { id: account };
  const meta = { ...action.meta, thunk };

  let token = yield select(state => selectToken(state, { account }));
  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (token === null) {
    yield putResolve(generateToken({ account }, { meta }));
    token = yield select(state => selectToken(state, { account }));
  }

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

const createWatchGenerateTokenSaga = createWatcherSaga(
  {
    takeType: TakeType.latestByKey,
    selector: action => action.payload?.account,
  },
  generateTokenSaga
);

export const sagas = {
  // mainTasksSaga: watchAllWithBuffer(
  //   [
  //     [createWatchUpdateSaga, actionChannel(update.type)],
  //     [createWatchFetchByAccountSaga, actionChannel(fetchByAccount.type)],
  //     [createWatchGenerateTokenSaga, actionChannel(generateToken.type)],
  //   ],
  //   {
  //     createContext: createSagaApiContext,
  //   }
  // ),
};
