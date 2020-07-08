import { createSlice } from '@reduxjs/toolkit';
import { actionChannel, call, getContext, put } from 'redux-saga/effects';
import createLinguoApiContext from '~/features/linguo/createSagaApiContext';
import { watchAllWithBuffer } from '~/features/web3/runWithContext';
import createAsyncAction, { matchAnyAsyncType } from '~/shared/createAsyncAction';
import createCancellableSaga from '~/shared/createCancellableSaga';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { registerTxSaga } from '../transactions/transactionsSlice';

export const initialState = {
  byTaskId: {},
  taskIds: [],
};

export const fetchByTaskId = createAsyncAction('evidences/fetchByTaskId');
export const submit = createAsyncAction('evidences/submit');

const actions = {
  fetchByTaskId,
  submit,
};

const evidencesSlice = createSlice({
  name: 'evidences',
  initialState,
  extraReducers: builder => {
    builder.addCase(fetchByTaskId.fulfilled, (state, action) => {
      const { taskId, data } = action.payload ?? {};

      if (taskId && data) {
        state.byTaskId[taskId] = state.byTaskId[taskId] ?? {};

        state.byTaskId[taskId].loadingState = 'succeeded';
        state.byTaskId[taskId].data = data;
        state.byTaskId[taskId].error = null;

        state.taskIds = [...new Set([...state.taskIds, taskId])];
      }
    });

    const createMatcher = matchAnyAsyncType(Object.values(actions));
    builder.addMatcher(createMatcher('pending'), (state, action) => {
      const { taskId } = action.payload ?? {};

      if (state.byTaskId[taskId]) {
        state.byTaskId[taskId].loadingState = 'loading';
      }
    });

    builder.addMatcher(createMatcher('fulfilled'), (state, action) => {
      const { taskId } = action.payload ?? {};

      if (state.byTaskId[taskId]) {
        state.byTaskId[taskId].loadingState = 'succeeded';
        state.byTaskId[taskId].error = null;
      }
    });

    builder.addMatcher(createMatcher('rejected'), (state, action) => {
      const { taskId, error } = action.payload ?? {};

      if (error && state.byTaskId[taskId]) {
        if (error && error.name !== 'CancellationError') {
          state.byTaskId[taskId].error = error;
          state.byTaskId[taskId].loadingState = 'failed';
        } else {
          state.byTaskId[taskId].loadingState = 'idle';
        }
      }
    });
  },
});

export default evidencesSlice.reducer;

const selectLoadingState = taskId => state => state.evidences.byTaskId[taskId]?.loadingState ?? 'idle';
export const selectIsLoadingByTaskId = taskId => state => selectLoadingState(taskId)(state) === 'loading';

export const selectByTaskId = taskId => state => state.evidences.byTaskId[taskId]?.data ?? null;
export const selectErrorByTaskId = taskId => state => state.evidences.byTaskId[taskId]?.error ?? null;

export function* fetchByTaskIdSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const taskId = action.payload?.taskId;
  const meta = action.meta;

  try {
    const data = yield call([linguoApi, 'getTaskDisputeEvidences'], { ID: taskId });

    yield put(fetchByTaskId.fulfilled({ taskId, data }, { meta }));
  } catch (err) {
    console.warn('Failed to fetch task dispute evidences:', err);
    yield put(fetchByTaskId.rejected({ taskId, error: err }, { meta }));
  }
}

export function* submitSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const { account, taskId, supportingSide, name, description, uploadedFile } = action.payload ?? {};
  const { metaTx, ...meta } = action.meta ?? {};

  try {
    const { tx } = yield call(
      [linguoApi, 'submitEvidence'],
      { ID: taskId, supportingSide, name, description, uploadedFile },
      { from: account }
    );

    yield call(registerTxSaga, tx, {
      ...metaTx,
      *onSuccess() {
        yield put(fetchByTaskId({ taskId }));
      },
    });

    yield put(submit.fulfilled({ taskId }, { meta }));
  } catch (err) {
    yield put(submit.rejected({ taskId, error: err }, { meta }));
  }
}

const createWatchFetchByTaskIdSaga = createWatcherSaga(
  { takeType: TakeType.latest },
  createCancellableSaga(fetchByTaskIdSaga, fetchByTaskId.rejected, {
    additionalPayload: action => ({ taskId: action.payload?.taskId }),
    additionalArgs: action => ({ meta: action.meta }),
  })
);

const createWatchSubmitSaga = createWatcherSaga({ takeType: TakeType.leading }, submitSaga);

export const sagas = {
  metaEvidencesSaga: watchAllWithBuffer(
    [
      [createWatchFetchByTaskIdSaga, actionChannel(fetchByTaskId.type)],
      [createWatchSubmitSaga, actionChannel(submit.type)],
    ],
    {
      createContext: createLinguoApiContext,
    }
  ),
};
