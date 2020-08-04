import { createSelector, createSlice } from '@reduxjs/toolkit';
import { push, replace } from 'connected-react-router';
import { put, putResolve, race, select, take } from 'redux-saga/effects';
import * as r from '~/app/routes';
import { TaskParty } from '~/features/tasks';
import { fetchByParty, INTERNAL_FETCH_KEY, selectAllFilterByIds } from '~/features/tasks/tasksSlice';
import createAsyncAction from '~/shared/createAsyncAction';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { compose, filter as arrayFilter, sort } from '~/shared/fp';
import { filters, getFilter, getFilterPredicate } from './filters';
import { getComparator } from './sorting';

export const initialState = {
  tasks: {
    byAccount: {},
    filter: filters.open,
  },
};

export const fetchTasks = createAsyncAction('requester/fetchTasks');

const requesterSlice = createSlice({
  name: 'requester',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.tasks.filter = getFilter(action.payload.filter);
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchTasks, (state, action) => {
      const account = action.payload?.account ?? null;

      state.tasks.byAccount[account] = state.tasks.byAccount[account] ?? {
        loadingState: 'idle',
        data: [],
      };
      state.tasks.byAccount[account].loadingState = 'loading';
    });

    builder.addCase(fetchTasks.rejected, (state, action) => {
      const account = action.payload?.account ?? null;

      state.tasks.byAccount[account].loadingState = 'failed';
    });

    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      const account = action.payload?.account ?? null;
      const data = action.payload?.data ?? [];

      state.tasks.byAccount[account].loadingState = 'succeeded';
      state.tasks.byAccount[account].data = data;
    });
  },
});

export const selectFilter = state => state.requester.tasks.filter ?? filters.open;

const selectLoadingState = (state, { account = null }) =>
  state.requester.tasks.byAccount[account]?.loadingState ?? 'idle';

export const selectIsIdle = createSelector([selectLoadingState], loadingState => loadingState === 'idle');
export const selectIsLoading = createSelector([selectLoadingState], loadingState => loadingState === 'loading');
export const selectHasSucceeded = createSelector([selectLoadingState], loadingState => loadingState === 'succeeded');
export const selectHasFailed = createSelector([selectLoadingState], loadingState => loadingState === 'failed');

export const selectAllTasks = (state, { account }) => {
  const taskIds = state.requester.tasks.byAccount[account]?.data ?? [];
  return selectAllFilterByIds(taskIds)(state);
};

export const selectTasksForFilter = createSelector([selectAllTasks, (_, { filter }) => filter], (tasks, filter) =>
  compose(sort(getComparator(filter)), arrayFilter(getFilterPredicate(filter)))(tasks)
);

export const selectTaskCountForFilter = createSelector([selectTasksForFilter], tasks => tasks.length);

export const selectTasksForCurrentFilter = createSelector(
  [state => state, (_, { account }) => account, selectFilter],
  (state, account, filter) => selectTasksForFilter(state, { account, filter })
);

export default requesterSlice.reducer;

export const { setFilter } = requesterSlice.actions;

export function* fetchTasksSaga(action) {
  const account = action.payload?.account ?? null;
  const thunk = action.meta?.thunk ?? { id: account };
  const meta = { ...action.meta, thunk };

  try {
    const result = yield putResolve(fetchByParty({ account, party: TaskParty.Requester }, { meta }));

    const tasks = result?.data ?? [];
    const ids = tasks.map(({ id }) => id);
    yield put(fetchTasks.fulfilled({ account, data: ids }, { meta }));

    if (ids.length === 0) {
      yield put(push(r.TRANSLATION_REQUEST));
    }
  } catch (err) {
    yield put(fetchTasks.rejected({ account, error: err.error }, { meta }));
  }
}

export function* processTasksFetchedInternallySaga(action) {
  const { key } = action.meta ?? {};
  const { account, party } = action.payload ?? {};

  if (key !== INTERNAL_FETCH_KEY || party !== TaskParty.Requester) {
    return;
  }

  while (true) {
    const { fulfilled, rejected } = yield race({
      fulfilled: take(fetchByParty.fulfilled.type),
      rejected: take(fetchByParty.rejected.type),
    });

    if (fulfilled && fulfilled.meta.key === INTERNAL_FETCH_KEY) {
      const tasks = fulfilled.payload?.data ?? [];
      const ids = tasks.map(({ id }) => id);
      yield put(fetchTasks.fulfilled({ account, data: ids }));

      break;
    }

    if (rejected && rejected.meta.key === INTERNAL_FETCH_KEY) {
      const error = rejected.payload?.error;
      yield put(fetchTasks.rejected({ account, error }));

      break;
    }
  }
}

export function* onFilterChangeSaga(action) {
  const currentFilterName = yield select(selectFilter);
  const { filter: newFilter, additionalParams } = action.payload ?? {};

  const normalizedNewFilterName = getFilter(newFilter);
  const search = new URLSearchParams({
    filter: normalizedNewFilterName,
    ...additionalParams,
  });

  const routerAction = normalizedNewFilterName === currentFilterName ? replace : push;

  yield put(routerAction({ search: search.toString() }));
}

export const sagas = {
  watchFetchTasksSaga: createWatcherSaga({ takeType: TakeType.latest }, fetchTasksSaga, fetchTasks.type),
  watchProcessTasksFetchedInternallySaga: createWatcherSaga(
    { takeType: TakeType.every },
    processTasksFetchedInternallySaga,
    fetchByParty.type
  ),
  watchSetFilterSaga: createWatcherSaga({ takeType: TakeType.every }, onFilterChangeSaga, setFilter),
};
