import { createReducer } from '@reduxjs/toolkit';
import { current } from 'immer';
import { actionChannel, call, getContext, put } from 'redux-saga/effects';
import createAsyncAction, { matchAnyAsyncType } from '~/shared/createAsyncAction';
import createSagaWithRejectionOnCancelation from '~/shared/createSagaWithRejectionOnCancelation';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { registerTxSaga } from '~/features/transactions/transactionsSlice';
import { Task } from './entities';

export const initialState = {
  loadingState: 'idle',
  data: null,
  error: null,
};

const fetchById = createAsyncAction('tasks/fetchById');
const getTranslatorDeposit = createAsyncAction('tasks/getTranslatorDeposit');
const getChallengerDeposit = createAsyncAction('tasks/getChallengerDeposit');
const getWithdrawableAmount = createAsyncAction('tasks/getWithdrawableAmount');
const getArbitrationCost = createAsyncAction('tasks/getArbitrationCost');
const assignTranslator = createAsyncAction('tasks/assignTranslator');
const submitTranslation = createAsyncAction('tasks/submitTranslation');
const challengeTranslation = createAsyncAction('tasks/challengeTranslation');
const approveTranslation = createAsyncAction('tasks/approveTranslation');
const reimburseRequester = createAsyncAction('tasks/reimburseRequester');
const withdrawAllFeesAndRewards = createAsyncAction('tasks/withdrawAllFeesAndRewards');

export const actions = {
  fetchById,
  getTranslatorDeposit,
  getChallengerDeposit,
  getWithdrawableAmount,
  getArbitrationCost,
  assignTranslator,
  submitTranslation,
  challengeTranslation,
  approveTranslation,
  reimburseRequester,
  withdrawAllFeesAndRewards,
};

export default createReducer(initialState, builder => {
  builder.addCase(fetchById.fulfilled, (state, action) => {
    const { data } = action.payload ?? {};

    if (data) {
      state.data = data;
    }
  });

  builder.addCase(assignTranslator.fulfilled, (state, action) => {
    const { id, account } = action.payload ?? {};
    const task = current(state).data;

    if (task.id === id) {
      state.data = Task.registerAssignment(task, { account });
    }
  });

  builder.addCase(submitTranslation.fulfilled, (state, action) => {
    const { id, uploadedFile } = action.payload ?? {};
    const task = current(state).data;

    if (task.id === id) {
      state.data = Task.registerSubmission(task, {
        translatedTextUrl: uploadedFile?.path,
      });
    }
  });

  builder.addCase(challengeTranslation.fulfilled, (state, action) => {
    const { id, account, uploadedFile } = action.payload ?? {};
    const task = current(state).data;

    if (task.id === id) {
      state.data = Task.registerChallenge(task, {
        account,
        evidence: uploadedFile?.path,
      });
    }
  });

  builder.addCase(approveTranslation.fulfilled, (state, action) => {
    const { id } = action.payload ?? {};
    const task = current(state).data;

    if (task.id === id) {
      state.data = Task.registerApproval(task);
    }
  });

  builder.addCase(reimburseRequester.fulfilled, (state, action) => {
    const { id } = action.payload ?? {};
    const task = current(state).data;

    if (task.id === id) {
      state.data = Task.registerReimbursement(task);
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
    const error = action.payload?.error;

    if (error) {
      if (error.name !== 'CancellationError') {
        state.loadingState = 'failed';
        state.error = error;
      } else {
        state.loadingState = 'idle';
      }
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

function* fetchByIdSaga(action) {
  const linguoApi = yield getContext('linguoApi');
  const { id } = action.payload ?? {};
  const { meta } = action;

  try {
    const data = yield call([linguoApi, 'getTaskById'], { ID: id });
    yield put(fetchById.fulfilled({ id, data }, { meta }));
  } catch (err) {
    yield put(fetchById.rejected({ id, error: err }, { meta }));
  }
}

function* getTranslatorDepositSaga(action) {
  const linguoApi = yield getContext('linguoApi');
  const { id } = action.payload ?? {};
  const { meta } = action;

  try {
    const data = yield call([linguoApi, 'getTranslatorDeposit'], { ID: id });
    const result = getTranslatorDeposit.fulfilled({ id, data }, { meta });

    yield put(result);
  } catch (err) {
    const result = getTranslatorDeposit.rejected({ id, error: err }, { meta });

    yield put(result);
  }
}

function* getChallengerDepositSaga(action) {
  const linguoApi = yield getContext('linguoApi');
  const { id } = action.payload ?? {};
  const { meta } = action;

  try {
    const data = yield call([linguoApi, 'getChallengerDeposit'], { ID: id });
    const result = getChallengerDeposit.fulfilled({ id, data }, { meta });

    yield put(result);
  } catch (err) {
    const result = getChallengerDeposit.rejected({ id, error: err }, { meta });

    yield put(result);
  }
}

function* getWithdrawableAmountSaga(action) {
  const linguoApi = yield getContext('linguoApi');
  const { id, account } = action.payload ?? {};
  const { meta } = action;

  try {
    const data = yield call([linguoApi, 'getWithdrawableAmount'], { ID: id, account });
    const result = getWithdrawableAmount.fulfilled({ id, data }, { meta });

    yield put(result);
  } catch (err) {
    const result = getWithdrawableAmount.rejected({ id, error: err }, { meta });

    yield put(result);
  }
}

function* getArbitrationCostSaga(action) {
  const linguoApi = yield getContext('linguoApi');
  const { id } = action.payload ?? {};
  const { meta } = action;

  try {
    const data = yield call([linguoApi, 'getArbitrationCost'], { ID: id });
    const result = getArbitrationCost.fulfilled({ id, data }, { meta });

    yield put(result);
  } catch (err) {
    const result = getArbitrationCost.rejected({ id, error: err }, { meta });

    yield put(result);
  }
}

function* assignTranslatorSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const { id, account } = action.payload ?? {};
  const { tx: metaTx, ...meta } = action.meta ?? {};

  const { tx } = yield call([linguoApi, 'assignTask'], { ID: id }, { from: account });

  try {
    yield call(registerTxSaga, tx, {
      ...metaTx,
      *onSuccess() {
        yield put(assignTranslator.fulfilled({ id, account }, { meta }));
      },
      *onFailure(resultAction) {
        const error = resultAction.payload?.error;
        yield put(assignTranslator.rejected({ id, error }, { meta }));
      },
    });
  } catch (err) {
    yield put(assignTranslator.rejected({ id, error: err }, { meta }));
  }
}

function* submitTranslationSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const { id, account, uploadedFile } = action.payload ?? {};
  const { tx: metaTx, ...meta } = action.meta ?? {};

  const { tx } = yield call([linguoApi, 'submitTranslation'], { ID: id, uploadedFile }, { from: account });

  try {
    yield call(registerTxSaga, tx, {
      ...metaTx,
      *onSuccess() {
        yield put(submitTranslation.fulfilled({ id, account, uploadedFile }));
      },
      *onFailure(resultAction) {
        const error = resultAction.payload?.error;
        yield put(submitTranslation.rejected({ id, error }, { meta }));
      },
    });
  } catch (err) {
    yield put(submitTranslation.rejected({ id, error: err }, { meta }));
  }
}

function* challengeTranslationSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const { id, account, uploadedFile } = action.payload ?? {};
  const { tx: metaTx, ...meta } = action.meta ?? {};

  const { tx } = yield call([linguoApi, 'challengeTranslation'], { ID: id, uploadedFile }, { from: account });

  try {
    yield call(registerTxSaga, tx, {
      ...metaTx,
      *onSuccess() {
        yield put(challengeTranslation.fulfilled({ id, account, uploadedFile }, { meta }));
      },
      *onFailure(resultAction) {
        const error = resultAction.payload?.error;
        yield put(challengeTranslation.rejected({ id, error }, { meta }));
      },
    });
  } catch (err) {
    yield put(challengeTranslation.rejected({ id, error: err }, { meta }));
  }
}

function* approveTranslationSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const { id, account } = action.payload ?? {};
  const { tx: metaTx, ...meta } = action.meta ?? {};

  const { tx } = yield call([linguoApi, 'approveTranslation'], { ID: id }, { from: account });

  try {
    yield call(registerTxSaga, tx, {
      ...metaTx,
      *onSuccess() {
        yield put(approveTranslation.fulfilled({ id, account }, { meta }));
      },
      *onFailure(resultAction) {
        const error = resultAction.payload?.error;
        yield put(approveTranslation.rejected({ id, error }, { meta }));
      },
    });
  } catch (err) {
    yield put(approveTranslation.rejected({ id, error: err }, { meta }));
  }
}

function* reimburseRequesterSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const { id, account } = action.payload ?? {};
  const { tx: metaTx, ...meta } = action.meta ?? {};

  const { tx } = yield call([linguoApi, 'reimburseRequester'], { ID: id }, { from: account });

  try {
    yield call(registerTxSaga, tx, {
      ...metaTx,
      *onSuccess() {
        yield put(reimburseRequester.fulfilled({ id, account }, { meta }));
      },
      *onFailure(resultAction) {
        const error = resultAction.payload?.error;
        yield put(reimburseRequester.rejected({ id, error }, { meta }));
      },
    });
  } catch (err) {
    yield put(reimburseRequester.rejected({ id, error: err }, { meta }));
  }
}

function* withdrawAllFeesAndRewardsSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const { id, account } = action.payload ?? {};
  const { tx: metaTx, ...meta } = action.meta ?? {};

  const { tx } = yield call([linguoApi, 'withdrawAllFeesAndRewards'], { ID: id, account }, { from: account });

  try {
    yield call(registerTxSaga, tx, {
      ...metaTx,
      *onSuccess() {
        yield put(withdrawAllFeesAndRewards.fulfilled({ id, account }, { meta }));
      },
      *onFailure(resultAction) {
        const error = resultAction.payload?.error;
        yield put(withdrawAllFeesAndRewards.rejected({ id, account, error }, { meta }));
      },
    });
  } catch (err) {
    yield put(withdrawAllFeesAndRewards.rejected({ id, account, error: err }, { meta }));
  }
}

const createWatchFetchByIdSaga = createWatcherSaga(
  {
    takeType: TakeType.latestByKey,
    selector: action => action.payload?.id,
  },
  createSagaWithRejectionOnCancelation(fetchByIdSaga, fetchById.rejected, {
    additionalPayload: action => ({ id: action.payload?.id }),
    additionalArgs: action => ({ meta: action.meta }),
  })
);

const createWatchGetTranslatorDepositSaga = createWatcherSaga({ takeType: TakeType.latest }, getTranslatorDepositSaga);

const createWatchGetChallengerDepositSaga = createWatcherSaga({ takeType: TakeType.latest }, getChallengerDepositSaga);

const createWatchGetWithdrawableAmountSaga = createWatcherSaga(
  { takeType: TakeType.latest },
  getWithdrawableAmountSaga
);

const createWatchGetArbitrationCostSaga = createWatcherSaga({ takeType: TakeType.latest }, getArbitrationCostSaga);

const createWatchAssignTranslatorSaga = createWatcherSaga({ takeType: TakeType.leading }, assignTranslatorSaga);

const createWatchSubmitTranslationSaga = createWatcherSaga({ takeType: TakeType.leading }, submitTranslationSaga);

const createWatchChallengeTranslationSaga = createWatcherSaga({ takeType: TakeType.leading }, challengeTranslationSaga);

const createWatchApproveTranslationSaga = createWatcherSaga({ takeType: TakeType.leading }, approveTranslationSaga);

const createWatchReimburseRequesterSaga = createWatcherSaga({ takeType: TakeType.leading }, reimburseRequesterSaga);

const createWatchWithdrawAllFeesAndRewardsSaga = createWatcherSaga(
  { takeType: TakeType.every },
  withdrawAllFeesAndRewardsSaga
);

export const sagaDescriptors = [
  [createWatchFetchByIdSaga, actionChannel(fetchById.type)],
  [createWatchGetTranslatorDepositSaga, actionChannel(getTranslatorDeposit.type)],
  [createWatchGetChallengerDepositSaga, actionChannel(getChallengerDeposit.type)],
  [createWatchGetWithdrawableAmountSaga, actionChannel(getWithdrawableAmount.type)],
  [createWatchGetArbitrationCostSaga, actionChannel(getArbitrationCost.type)],
  [createWatchAssignTranslatorSaga, actionChannel(assignTranslator.type)],
  [createWatchSubmitTranslationSaga, actionChannel(submitTranslation.type)],
  [createWatchChallengeTranslationSaga, actionChannel(challengeTranslation.type)],
  [createWatchApproveTranslationSaga, actionChannel(approveTranslation.type)],
  [createWatchReimburseRequesterSaga, actionChannel(reimburseRequester.type)],
  [createWatchWithdrawAllFeesAndRewardsSaga, actionChannel(withdrawAllFeesAndRewards.type)],
];
