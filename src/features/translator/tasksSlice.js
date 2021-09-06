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
      const chainId = action.payload?.chainId ?? null;

      state.byAccount[account] = state.byAccount[account] ?? {};
      state.byAccount[account].byChainId = state.byAccount[account].byChainId ?? {
        [chainId]: {
          loadingState: 'idle',
          ids: [],
        },
      };
      state.byAccount[account].byChainId[chainId] = state.byAccount[account].byChainId[chainId] ?? {
        loadingState: 'idle',
        ids: [],
      };

      state.byAccount[account].byChainId[chainId].loadingState = 'loading';
    });

    builder.addCase(fetchTasks.rejected, (state, action) => {
      const account = action.payload?.account ?? null;
      const chainId = action.payload?.chainId ?? null;

      state.byAccount[account].byChainId[chainId].loadingState = 'failed';
    });

    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      const account = action.payload?.account ?? null;
      const chainId = action.payload?.chainId ?? null;
      const ids = action.payload?.ids ?? [];

      state.byAccount[account].byChainId[chainId].loadingState = 'fetched';
      state.byAccount[account].byChainId[chainId].ids = ids;
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

export const selectLoadingState = (state, { account = null, chainId }) =>
  state.byAccount[account]?.byChainId[chainId]?.loadingState ?? 'idle';
export const selectIsIdle = (state, { account, chainId }) => selectLoadingState(state, { account, chainId }) === 'idle';
export const selectIsLoading = (state, { account, chainId }) =>
  selectLoadingState(state, { account, chainId }) === 'loading';
export const selectHasFetched = (state, { account, chainId }) =>
  selectLoadingState(state, { account, chainId }) === 'fetched';
export const selectHasFailed = (state, { account, chainId }) =>
  selectLoadingState(state, { account, chainId }) === 'failed';

export const selectTaskIds = (state, { account, chainId }) => state.byAccount[account]?.byChainId[chainId]?.ids ?? [];

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
  const chainId = action.payload?.chainId ?? null;
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
          chainId,
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
    yield put(fetchTasks.fulfilled({ account, chainId, ids }, { meta }));
  } catch (err) {
    yield put(fetchTasks.rejected({ account, chainId, error: err.error }, { meta }));
  }
}

export const sagas = {
  watchFetchTasksSaga: createWatcherSaga({ takeType: TakeType.latest }, fetchTasksSaga, fetchTasks.type),
};
