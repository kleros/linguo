import { createSlice } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { put, race, take, putResolve } from 'redux-saga/effects';
import * as r from '~/app/routes';
import createAsyncAction from '~/features/shared/createAsyncAction';
import createWatcherSaga, { TakeType } from '~/features/shared/createWatcherSaga';
import { TaskParty } from '~/features/tasks';
import { fetchByParty, selectAllFilterByIds, INTERNAL_FETCH_KEY } from '~/features/tasks/tasksSlice';

export const initialState = {
  tasks: {
    byAccount: {},
  },
};

export const fetchTasks = createAsyncAction('requester/fetchTasks');

const requesterSlice = createSlice({
  name: 'requester',
  initialState,
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

const selectLoadingState = (account = null) => state =>
  state.requester.tasks.byAccount[account]?.loadingState ?? 'idle';
export const selectIsIdle = account => state => selectLoadingState(account)(state) === 'idle';
export const selectIsLoading = account => state => selectLoadingState(account)(state) === 'loading';
export const selectHasSucceeded = account => state => selectLoadingState(account)(state) === 'succeeded';
export const selectHasFailed = account => state => selectLoadingState(account)(state) === 'failed';

export const selectTasks = account => state => {
  const taskIds = state.requester.tasks.byAccount[account]?.data ?? [];
  return selectAllFilterByIds(taskIds)(state);
};

export default requesterSlice.reducer;

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
      yield put(
        push({
          pathname: r.TRANSLATION_REQUEST,
          state: {
            message: 'You have no translation requests yet! You can create one here.',
          },
        })
      );
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

export const sagas = {
  watchFetchTasksSaga: createWatcherSaga({ takeType: TakeType.latest }, fetchTasksSaga, fetchTasks.type),
  watchProcessTasksFetchedInternallySaga: createWatcherSaga(
    { takeType: TakeType.every },
    processTasksFetchedInternallySaga,
    fetchByParty.type
  ),
};
