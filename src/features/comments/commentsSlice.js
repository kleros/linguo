import { createSlice } from '@reduxjs/toolkit';
import { actionChannel, call, getContext, put } from 'redux-saga/effects';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { watchAllWithBuffer } from '~/features/web3/runWithContext';
import createAsyncAction, { matchAnyAsyncType } from '~/shared/createAsyncAction';
import createSagaWithRejectionOnCancelation from '~/shared/createSagaWithRejectionOnCancelation';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { pick } from '~/shared/fp';
import { createInstance } from './api';

export const getComments = createAsyncAction('comments/threads/getComments');
export const addComment = createAsyncAction('comments/threads/addComments');

const createThreadActionsMatcher = matchAnyAsyncType(
  Object.values({
    getComments,
    addComment,
  })
);

const PER_CHAIN_INITIAL_STATE = {
  byTaskId: {},
};

const PER_ITEM_INITIAL_STATE = {
  loadingState: 'idle',
  error: null,
  entities: [],
};

export const initialState = {
  byChainId: {},
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  extraReducers: builder => {
    builder.addCase(getComments.fulfilled, (state, action) => {
      const { chainId, taskId, data } = action.payload ?? {};
      if (chainId && taskId) {
        state.byChainId[chainId] = state.byChainId[chainId] ?? { ...PER_CHAIN_INITIAL_STATE };
        state.byChainId[chainId].byTaskId[taskId] = state.byChainId[chainId]?.byTaskId?.[taskId] ?? {
          ...PER_ITEM_INITIAL_STATE,
        };
        state.byChainId[chainId].byTaskId[taskId].entities = data;
      }
    });

    builder.addCase(addComment.pending, (state, action) => {
      const { chainId, taskId, comment } = action.payload ?? {};
      if (chainId && taskId) {
        state.byChainId[chainId] = state.byChainId[chainId] ?? { ...PER_CHAIN_INITIAL_STATE };
        state.byChainId[chainId].byTaskId[taskId] = state.byChainId[chainId]?.byTaskId?.[taskId] ?? {
          ...PER_ITEM_INITIAL_STATE,
        };
        state.byChainId[chainId].byTaskId[taskId].entities.push(comment);
      }
    });

    builder.addMatcher(createThreadActionsMatcher('pending'), (state, action) => {
      const { chainId, taskId } = action.payload ?? {};

      if (chainId && taskId) {
        state.byChainId[chainId] = state.byChainId[chainId] ?? { ...PER_CHAIN_INITIAL_STATE };
        state.byChainId[chainId].byTaskId[taskId] = state.byChainId[chainId]?.byTaskId?.[taskId] ?? {
          ...PER_ITEM_INITIAL_STATE,
        };
        state.byChainId[chainId].byTaskId[taskId].loadingState = 'loading';
        state.byChainId[chainId].byTaskId[taskId].error = null;
      }
    });

    builder.addMatcher(createThreadActionsMatcher('fulfilled'), (state, action) => {
      const { chainId, taskId } = action.payload ?? {};

      if (state.byChainId[chainId]?.byTaskId?.[taskId]) {
        state.byChainId[chainId].byTaskId[taskId].loadingState = 'succeeded';
        state.byChainId[chainId].byTaskId[taskId].error = null;
      }
    });

    builder.addMatcher(createThreadActionsMatcher('rejected'), (state, action) => {
      const { chainId, taskId, error } = action.payload ?? {};

      if (error && state.byChainId[chainId]?.byTaskId?.[taskId]) {
        if (error.name !== 'CancellationError') {
          state.byChainId[chainId].byTaskId[taskId].error = error;
          state.byChainId[chainId].byTaskId[taskId].loadingState = 'failed';
        } else {
          state.byChainId[chainId].byTaskId[taskId].loadingState = 'idle';
        }
      }
    });
  },
});

const PERSISTANCE_KEY = 'comments';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    storage,
    version: 0,
    blacklist: [],
  };

  return persistReducer(persistConfig, reducer);
}

export default createPersistedReducer(commentsSlice.reducer);

export const selectIsInitializing = (state, { chainId }) =>
  state.comments.byChainId[chainId]?.status === 'initializing';
export const selectIsReady = (state, { chainId }) => state.comments.byChainId[chainId]?.status === 'ready';

const selectThread = (state, { chainId, taskId }) => state.comments.byChainId[chainId]?.byTaskId?.[taskId] ?? {};

export const selectThreadComments = (state, { chainId, taskId }) =>
  selectThread(state, { chainId, taskId })?.entities ?? [];
export const selectThreadIsLoading = (state, { chainId, taskId }) =>
  selectThread(state, { chainId, taskId })?.loadingState === 'loading';
export const selectThreadError = (state, { chainId, taskId }) =>
  selectThread(state, { chainId, taskId })?.error ?? null;

function* getPostsSaga(action) {
  const commentsApi = yield getContext('commentsApi');

  const { account, chainId, taskId } = action.payload ?? {};
  const threadId = `${chainId}/${taskId}`;
  const meta = action.meta;

  try {
    const data = yield call([commentsApi, 'getPosts'], account, threadId);
    yield put(getComments.fulfilled({ account, chainId, taskId, data }, { meta }));
  } catch (err) {
    yield put(getComments.rejected({ account, chainId, taskId, error: err }, { meta }));
  }
}

const createWatchGetPostsSaga = createWatcherSaga(
  {
    takeType: TakeType.latestByKey,
    selector: action => action.payload?.taskId,
  },
  createSagaWithRejectionOnCancelation(getPostsSaga, getComments.rejected, {
    additionalPayload: action => pick(['account', 'chainId', 'taskId'], action.payload),
    additionalArgs: action => ({ meta: action.meta }),
  })
);

function* addPostSaga(action) {
  const commentsApi = yield getContext('commentsApi');

  const { account, chainId, taskId, comment } = action.payload ?? {};
  const threadId = `${chainId}/${taskId}`;
  const meta = action.meta;

  try {
    yield call([commentsApi, 'addPost'], account, threadId, comment.message);
    yield put(addComment.fulfilled({ account, chainId, taskId }, { meta }));
  } catch (err) {
    yield put(addComment.rejected({ account, chainId, taskId, error: err }, { meta }));
  }
}

const createWatchAddPostSaga = createWatcherSaga(
  {
    takeType: TakeType.throttleByKey,
    selector: action => action.payload?.taskId,
    timeout: 1000,
  },
  createSagaWithRejectionOnCancelation(addPostSaga, addComment.rejected, {
    additionalPayload: action => pick(['account', 'chainId', 'taskId', 'content'], action.payload),
    additionalArgs: action => ({ meta: action.meta }),
  })
);

export const sagas = {
  commentsSaga: watchAllWithBuffer(
    [
      [createWatchGetPostsSaga, actionChannel(getComments.type)],
      [createWatchAddPostSaga, actionChannel(addComment.type)],
    ],
    {
      createContext: function* createCommentsApi({ library: web3 }) {
        try {
          const commentsApi = yield call(createInstance, { web3 });
          return { commentsApi };
        } catch (err) {
          console.warn('Failed to create comments API instance', err);
          throw err;
        }
      },
    }
  ),
};
