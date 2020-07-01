import { createReducer } from '@reduxjs/toolkit';
import { original } from 'immer';
import { actionChannel, call, getContext, put, spawn, take } from 'redux-saga/effects';
import createAsyncAction, { matchAnyAsyncType } from '~/features/shared/createAsyncAction';
import createCancellableSaga from '~/features/shared/createCancellableSaga';
import createWatcherSaga, { TakeType } from '~/features/shared/createWatcherSaga';
import { confirm, matchTxResult, registerTxSaga } from '~/features/transactions/transactionsSlice';
import { Task } from './entities';

export const initialState = {
  loadingState: 'idle',
  data: null,
  error: null,
};

const fetchById = createAsyncAction('tasks/fetchById');
const getChallengerDeposit = createAsyncAction('tasks/getChallengerDeposit');
const reimburseRequester = createAsyncAction('tasks/reimburseRequester');

export const actions = {
  fetchById,
  getChallengerDeposit,
  reimburseRequester,
};

export default createReducer(initialState, builder => {
  builder.addCase(fetchById.fulfilled, (state, action) => {
    const { data } = action.payload ?? {};

    if (data) {
      state.data = data;
    }
  });

  builder.addCase(reimburseRequester.fulfilled, (state, action) => {
    const id = action.payload?.id;
    const task = state.data;

    if (task.id === id) {
      state.data = Task.registerReimbursement(original(task));
    }
  });

  const createMatcher = matchAnyAsyncType(Object.values(actions));

  builder.addMatcher(createMatcher('pending'), state => {
    state.loadingState = 'loading';
  });

  builder.addMatcher(createMatcher('fulfilled'), state => {
    state.loadingState = 'succeeded';
    state.error = null;
  });

  builder.addMatcher(createMatcher('rejected'), (state, action) => {
    state.loadingState = 'failed';
    const error = action.payload?.error;

    if (error && error.name !== 'CancellationError') {
      state.error = error;
    }
  });
});

const selectLoadingState = state => state?.loadingState ?? 'idle';
const selectIsLoading = state => selectLoadingState(state) === 'loading';
const selectHasFailed = state => selectLoadingState(state) === 'failed';

const selectData = state => state?.data;
const selectError = state => state?.error;

export const selectors = {
  selectIsLoading,
  selectHasFailed,
  selectData,
  selectError,
};

export function* fetchByIdSaga(action) {
  const linguoApi = yield getContext('linguoApi');
  const { id } = action.payload ?? {};

  try {
    const data = yield call([linguoApi, 'getTaskById'], { ID: id });
    yield put(fetchById.fulfilled({ id, data }));
  } catch (err) {
    yield put(fetchById.rejected({ id, error: err }));
  }
}

export function* getChallengerDepositSaga(action) {
  const linguoApi = yield getContext('linguoApi');
  const { id } = action.payload ?? {};
  const meta = action.meta;

  try {
    const data = yield call([linguoApi, 'getChallengerDeposit'], { ID: id });
    const result = getChallengerDeposit.fulfilled({ id, data }, { meta });

    yield put(result);
  } catch (err) {
    const result = getChallengerDeposit.rejected({ id, error: err }, { meta, error: true });

    yield put(result);
  }
}

export function* reimburseRequesterSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const { account, id } = action.payload ?? {};
  const { tx } = yield call([linguoApi, 'reimburseRequester'], { ID: id }, { from: account });

  try {
    const { txHash } = yield call(registerTxSaga, tx);

    yield spawn(function* updateAfterTxMined() {
      // Wait until the tx is confirmed or fails
      const resultAction = yield take(matchTxResult({ txHash }));

      // If the tx is successfull, fetch the tasks again
      if (confirm.match(resultAction)) {
        yield put(reimburseRequester.fulfilled({ id }));
      } else {
        yield put(reimburseRequester.rejected({ id, error: resultAction.payload.error }));
      }
    });
  } catch (err) {
    yield put(reimburseRequester.rejected({ id, error: err }));
  }
}

export const createWatchFetchByIdSaga = createWatcherSaga(
  { takeType: TakeType.latest },
  createCancellableSaga(fetchByIdSaga, fetchById.rejected, {
    additionalPayload: action => ({ id: action.payload?.id }),
  })
);

export const createWatchGetChallengerDepositSaga = createWatcherSaga(
  { takeType: TakeType.latest },
  getChallengerDepositSaga
);

export const createWatchReimburseRequesterSaga = createWatcherSaga(
  { takeType: TakeType.leading },
  reimburseRequesterSaga
);

export const sagaDescriptors = [
  [createWatchFetchByIdSaga, actionChannel(fetchById.type)],
  [createWatchGetChallengerDepositSaga, actionChannel(getChallengerDeposit.type)],
  [createWatchReimburseRequesterSaga, actionChannel(reimburseRequester.type)],
];
