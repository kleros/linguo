import { createSlice } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { put, putResolve, select } from 'redux-saga/effects';
import * as r from '~/app/routes';
import { TaskParty } from '~/features/tasks';
import { fetchByParty } from '~/features/tasks/tasksSlice';
import createAsyncAction from '~/shared/createAsyncAction';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { getStatusFilter, statusFilters } from './taskFilters';
import { selectAllSkills } from './translatorSlice';

export const initialState = {
  byAccount: {},
  filters: {
    status: statusFilters.open,
    allTasks: false,
  },
};

export const fetchTasks = createAsyncAction('translator/tasks/fetch');

const translatorTasksSlice = createSlice({
  name: 'translator/tasks',
  initialState,
  reducers: {
    setFilters(state, action) {
      const { status, allTasks = false } = action.payload ?? {};

      state.filters.status = getStatusFilter(status);
      state.filters.allTasks = allTasks;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchTasks, (state, action) => {
      const account = action.payload?.account ?? null;

      state.byAccount[account] = state.byAccount[account] ?? {
        loadingState: 'idle',
        ids: [],
      };
      state.byAccount[account].loadingState = 'loading';
    });

    builder.addCase(fetchTasks.rejected, (state, action) => {
      const account = action.payload?.account ?? null;

      state.byAccount[account].loadingState = 'failed';
    });

    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      const account = action.payload?.account ?? null;
      const data = action.payload?.data ?? [];

      state.byAccount[account].loadingState = 'fetched';
      state.byAccount[account].ids = data;
    });
  },
});

export default translatorTasksSlice.reducer;

export const actions = {
  fetchTasks,
  ...translatorTasksSlice.actions,
};

export const selectStatusFilter = state => state.filters?.status ?? statusFilters.open;

export const selectAllTasksFilter = state => state.filters?.allTasks ?? false;

export const selectLoadingState = (state, { account = null }) => state.byAccount[account]?.loadingState ?? 'idle';
export const selectIsIdle = (state, { account }) => selectLoadingState(state, { account }) === 'idle';
export const selectIsLoading = (state, { account }) => selectLoadingState(state, { account }) === 'loading';
export const selectHasFetched = (state, { account }) => selectLoadingState(state, { account }) === 'fetched';
export const selectHasFailed = (state, { account }) => selectLoadingState(state, { account }) === 'failed';

export const selectTaskIds = (state, { account }) => state.byAccount[account]?.ids ?? [];

export const selectors = {
  selectStatusFilter,
  selectAllTasksFilter,
  selectIsIdle,
  selectIsLoading,
  selectHasFetched,
  selectHasFailed,
  selectTaskIds,
};

export function* fetchTasksSaga(action) {
  const account = action.payload?.account ?? null;
  const thunk = action.meta?.thunk ?? { id: account };
  const meta = { ...action.meta, thunk };

  const skills = yield select(selectAllSkills);

  if (skills.length === 0) {
    yield put(
      push({
        pathname: r.TRANSLATOR_SETTINGS,
        state: {
          message: 'Please set your skills first.',
        },
      })
    );

    yield put(
      fetchTasks.rejected(
        {
          account,
          error: new Error('Cancelled because translator skills were not set'),
        },
        { meta }
      )
    );

    return;
  }

  try {
    const result = yield putResolve(fetchByParty({ account, skills, party: TaskParty.Translator }, { meta }));

    const tasks = result?.data ?? [];
    const ids = tasks.map(({ id }) => id);
    yield put(fetchTasks.fulfilled({ account, data: ids }, { meta }));
  } catch (err) {
    yield put(fetchTasks.rejected({ account, error: err.error }, { meta }));
  }
}

export const sagas = {
  watchFetchTasksSaga: createWatcherSaga({ takeType: TakeType.latest }, fetchTasksSaga, fetchTasks.type),
};
