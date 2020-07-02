import { createSlice } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { put, putResolve, select } from 'redux-saga/effects';
import * as r from '~/app/routes';
import createAsyncAction from '~/features/shared/createAsyncAction';
import createWatcherSaga, { TakeType } from '~/features/shared/createWatcherSaga';
import { TaskParty } from '~/features/tasks';
import { fetchByParty } from '~/features/tasks/tasksSlice';
import { selectAllSkills } from './translatorSlice';

export const initialState = {
  byAccount: {},
};

export const fetchTasks = createAsyncAction('translator/fetchTasks');

const translatorTasksSlice = createSlice({
  name: 'translator',
  initialState,
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
};

export const selectLoadingState = (account = null) => state => state.byAccount[account]?.loadingState ?? 'idle';
export const selectIsIdle = account => state => selectLoadingState(account)(state) === 'idle';
export const selectIsLoading = account => state => selectLoadingState(account)(state) === 'loading';
export const selectHasFetched = account => state => selectLoadingState(account)(state) === 'fetched';
export const selectHasFailed = account => state => selectLoadingState(account)(state) === 'failed';

export const selectTaskIds = account => state => state.byAccount[account]?.ids ?? [];

export const selectors = {
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
