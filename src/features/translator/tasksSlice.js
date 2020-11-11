import { createSlice } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { put, putResolve, select } from 'redux-saga/effects';
import * as r from '~/app/routes';
import { TaskParty } from '~/features/tasks';
import { fetchByParty } from '~/features/tasks/tasksSlice';
import createAsyncAction from '~/shared/createAsyncAction';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { filters, getFilter, getSecondLevelFilter, hasSecondLevelFilters } from './taskFilters';
import { selectAllSkills } from './translatorSlice';

export const initialState = {
  byAccount: {},
  filter: filters.open,
  secondLevelFilter: {},
};

export const fetchTasks = createAsyncAction('translator/tasks/fetch');

const translatorTasksSlice = createSlice({
  name: 'translator/tasks',
  initialState,
  reducers: {
    setFilters(state, action) {
      const { filter, secondLevelFilter } = action.payload ?? {};

      state.filter = getFilter(filter);
      if (hasSecondLevelFilters(filter) && secondLevelFilter) {
        state.secondLevelFilter = state.secondLevelFilter ?? {};
        state.secondLevelFilter[state.filter] = getSecondLevelFilter(filter, secondLevelFilter);
      }
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

export const selectFilter = state => state.filter;

export const selectSecondLevelFilter = state => state.secondLevelFilter?.[state.filter];

export const selectSecondLevelFilterForFilter = (state, { filter }) => state.secondLevelFilter?.[filter];

export const selectLoadingState = (state, { account = null }) => state.byAccount[account]?.loadingState ?? 'idle';
export const selectIsIdle = (state, { account }) => selectLoadingState(state, { account }) === 'idle';
export const selectIsLoading = (state, { account }) => selectLoadingState(state, { account }) === 'loading';
export const selectHasFetched = (state, { account }) => selectLoadingState(state, { account }) === 'fetched';
export const selectHasFailed = (state, { account }) => selectLoadingState(state, { account }) === 'failed';

export const selectTaskIds = (state, { account }) => state.byAccount[account]?.ids ?? [];

export const selectors = {
  selectFilter,
  selectSecondLevelFilter,
  selectSecondLevelFilterForFilter,
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
