import { createSelector, createSlice } from '@reduxjs/toolkit';
import { put, putResolve, select } from 'redux-saga/effects';
import { persistReducer, createMigrate } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { push, replace } from 'connected-react-router';
import { TaskParty } from '~/features/tasks';
import { fetchByParty, create, selectAllFilterByIds } from '~/features/tasks/tasksSlice';
import { selectChainId } from '~/features/web3/web3Slice';
import createAsyncAction from '~/shared/createAsyncAction';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { compose, filter, sort } from '~/shared/fp';
import migrations from './migrations';
import { statusFilters, getStatusFilter, getStatusFilterPredicate } from './filters';
import { getComparator } from './sorting';
import { LanguageGroupPair, getLanguageGroup } from '../linguo/languagePairing';

export const initialState = {
  tasks: {
    byAccount: {},
    filters: {
      status: statusFilters.all,
    },
  },
};

export const fetchTasks = createAsyncAction('requester/fetchTasks');

const requesterSlice = createSlice({
  name: 'requester',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.tasks.filters = state.tasks.filters ?? {};
      state.tasks.filters.status = getStatusFilter(action.payload.status);
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchTasks, (state, action) => {
      const account = action.payload?.account ?? null;
      const chainId = action.payload?.chainId;

      state.tasks.byAccount[account] = state.tasks.byAccount[account] ?? {};
      state.tasks.byAccount[account].byChainId = state.tasks.byAccount[account].byChainId ?? {
        [chainId]: {
          loadingState: 'idle',
          ids: [],
        },
      };

      state.tasks.byAccount[account].byChainId[chainId] = state.tasks.byAccount[account].byChainId[chainId] ?? {
        loadingState: 'idle',
        ids: [],
      };

      state.tasks.byAccount[account].byChainId[chainId].loadingState = 'loading';
    });

    builder.addCase(fetchTasks.rejected, (state, action) => {
      const account = action.payload?.account ?? null;
      const chainId = action.payload?.chainId;

      state.tasks.byAccount[account].byChainId[chainId].loadingState = 'failed';
    });

    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      const account = action.payload?.account ?? null;
      const chainId = action.payload?.chainId;
      const ids = action.payload?.ids ?? [];

      state.tasks.byAccount[account].byChainId[chainId].loadingState = 'succeeded';
      state.tasks.byAccount[account].byChainId[chainId].ids = ids;
    });
  },
});

const PERSISTANCE_KEY = 'requester';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    storage,
    version: 1,
    migrate: createMigrate(migrations, { debug: process.env.NODE_ENV !== 'production' }),
    blacklist: [],
  };

  return persistReducer(persistConfig, reducer);
}

export default createPersistedReducer(requesterSlice.reducer);

export const selectStatusFilter = state => state.requester.tasks?.filters?.status ?? statusFilters.all;

const selectLoadingState = (state, { account = null, chainId }) =>
  state.requester.tasks.byAccount[account]?.byChainId[chainId]?.loadingState ?? 'idle';

export const selectIsIdle = createSelector([selectLoadingState], loadingState => loadingState === 'idle');
export const selectIsLoading = createSelector([selectLoadingState], loadingState => loadingState === 'loading');
export const selectHasSucceeded = createSelector([selectLoadingState], loadingState => loadingState === 'succeeded');
export const selectHasFailed = createSelector([selectLoadingState], loadingState => loadingState === 'failed');

export const selectAllTasks = (state, { account, chainId }) => {
  const taskIds = state.requester.tasks.byAccount[account]?.byChainId[chainId]?.ids ?? [];
  return selectAllFilterByIds(taskIds)(state);
};

export const selectTasksForFilter = createSelector([selectAllTasks, (_, { status }) => status], (tasks, status) =>
  compose(sort(getComparator(status)), filter(getStatusFilterPredicate(status)))(tasks)
);

export const selectTaskCountForFilter = createSelector([selectTasksForFilter], tasks => tasks.length);

export const selectTasksForCurrentFilter = createSelector(
  [state => state, (_, { account }) => account, (_, { chainId }) => chainId, selectStatusFilter],
  (state, account, chainId, status) => selectTasksForFilter(state, { account, chainId, status })
);

export const { setFilter } = requesterSlice.actions;

export function* fetchTasksSaga(action) {
  const account = action.payload?.account ?? null;
  const chainId = action.payload?.chainId ?? null;
  const thunk = action.meta?.thunk ?? { id: account };
  const meta = { ...action.meta, thunk };

  try {
    const result = yield putResolve(fetchByParty({ account, chainId, party: TaskParty.Requester }, { meta }));

    const tasks = result?.data ?? [];
    const ids = tasks.map(({ id }) => id);
    yield put(fetchTasks.fulfilled({ account, chainId, ids }, { meta }));
  } catch (err) {
    yield put(fetchTasks.rejected({ account, chainId, error: err.error }, { meta }));
  }
}

export function* handleTaskCreateTxnMined(action) {
  const { account, sourceLanguage, targetLanguage } = action.payload ?? {};
  const languageGroupPair = String(LanguageGroupPair.of([sourceLanguage, targetLanguage].map(getLanguageGroup)));
  const chainId = yield select(selectChainId);

  yield put(fetchTasks({ account, chainId }, { meta: { hints: { languageGroupPairs: [languageGroupPair] } } }));
}

export function* onFilterChangeSaga(action) {
  const currentStatus = yield select(selectStatusFilter);
  const { status, additionalParams } = action.payload ?? {};

  const normalizedStatus = getStatusFilter(status);
  const search = new URLSearchParams({
    status: normalizedStatus,
    ...additionalParams,
  });

  const routerAction = normalizedStatus === currentStatus ? replace : push;

  yield put(routerAction({ search: search.toString() }));
}

export const sagas = {
  watchFetchTasksSaga: createWatcherSaga({ takeType: TakeType.latest }, fetchTasksSaga, fetchTasks.type),
  watchProcessTasksFetchedInternallySaga: createWatcherSaga(
    { takeType: TakeType.every },
    handleTaskCreateTxnMined,
    create.mined.type
  ),
  watchSetFilterSaga: createWatcherSaga({ takeType: TakeType.every }, onFilterChangeSaga, setFilter.type),
};
