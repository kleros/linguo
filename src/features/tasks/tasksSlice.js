import { createSlice } from '@reduxjs/toolkit';
import { call, cancelled, getContext, put, select } from 'redux-saga/effects';
import createAsyncAction from '~/features/shared/createAsyncAction';
import createWatchSaga, { TakeType } from '~/features/shared/createWatchSaga';
import { watchAll } from '~/features/web3/runWithContext';
import { selectChainId } from '~/features/web3/web3Slice';
import TaskParty from './entities/TaskParty';
import createApiFacade from './createApiFacade';
import createApiFacadePlaceholder from './createApiFacadePlaceholder';

export const fetchByParty = createAsyncAction('tasks/fetchByParty');
export const fetchById = createAsyncAction('tasks/fetchById');

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    loadingState: 'idle',
    entities: {},
    ids: [],
  },
  reducers: {
    add(state, action) {
      const { id } = action.payload ?? {};
      if (!id) {
        return;
      }

      state.entities[id] = action.payload;

      if (!state.ids.includes(id)) {
        state.push(id);
      }
    },
    setLoadingState(state, action) {
      state.loadingState = action.payload.loadingState;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchByParty.fulfilled, (state, action) => {
      const tasks = action.payload?.data ?? [];
      const tasksMixin = tasks.reduce(
        (acc, task) =>
          task.id !== undefined
            ? Object.assign(acc, {
                [task.id]: task,
              })
            : acc,
        {}
      );

      Object.assign(state.entities, tasksMixin);
      state.ids = [...new Set([...state.ids, ...Object.keys(tasksMixin)])];
    });

    builder.addMatcher(
      action => /^tasks\/.*\/pending$/.test(action.type),
      state => {
        state.loadingState = 'loading';
      }
    );

    builder.addMatcher(
      action => /^tasks\/.*\/fulfilled$/.test(action.type),
      state => {
        state.loadingState = 'fetched';
      }
    );

    builder.addMatcher(
      action => /^tasks\/.*\/rejected$/.test(action.type),
      state => {
        state.loadingState = 'failed';
      }
    );
  },
});

export default tasksSlice.reducer;

const { setLoadingState } = tasksSlice.actions;

export const { add } = tasksSlice.actions;

export const selectAll = state => state.tasks.ids.map(id => state.tasks.entities[id]);

export const selectById = id => state => state.tasks.entities[id];

export const selectAllFilterByIds = ids => state =>
  ids.reduce((acc, id) => {
    const task = state.tasks.entities[id];
    return task ? acc.concat(task) : acc;
  }, []);

export const selectIsIdle = state => state.tasks.loadingState === 'idle';
export const selectIsLoading = state => state.tasks.loadingState === 'loading';
export const selectHasFetched = state => state.tasks.loadingState === 'fetched';
export const selectHasFailed = state => state.tasks.loadingState === 'failed';

export function* fetchByPartySaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const apiMethodByTaskParty = {
    [TaskParty.Requester]: 'getRequesterTasks',
    [TaskParty.Translator]: 'getTranslatorTasks',
  };

  const { account, party = TaskParty.Requester, skills } = action.payload ?? {};
  const { key } = action.meta ?? {};

  const method = apiMethodByTaskParty[party];
  if (!method) {
    yield put(
      fetchByParty.rejected({
        error: new Error('TaskParty should be either Requester or Translator'),
      })
    );
    return;
  }

  try {
    const data = yield call([linguoApi, method], { account, skills });
    yield put(fetchByParty.fulfilled({ data }, { key }));
  } catch (err) {
    console.warn(err);
    yield put(fetchByParty.rejected({ error: err }, { key }));
  }
}

const watchFetchTasksSaga = createWatchSaga(withResetLoadingStateOnCancel(fetchByPartySaga), fetchByParty, {
  takeType: TakeType.latest,
});

export const sagas = {
  mainLinguoSaga: watchAll([watchFetchTasksSaga], {
    *createContext({ library: web3 }) {
      const chainId = yield select(selectChainId);

      if (!chainId || !web3) {
        return { linguoApi: yield call(createApiFacadePlaceholder) };
      }

      try {
        return { linguoApi: yield call(createApiFacade, { web3, chainId }) };
      } catch (err) {
        console.warn('Failed to create Linguo API Facade', err);
        return { linguoApi: yield call(createApiFacadePlaceholder) };
      }
    },
  }),
};

export function withResetLoadingStateOnCancel(saga) {
  return function* resetLoadingStateOnCancelSaga(...args) {
    try {
      yield call(saga, ...args);
    } finally {
      if (yield cancelled()) {
        yield put(setLoadingState({ loadingState: 'idle' }));
      }
    }
  };
}
