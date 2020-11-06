import { createSlice } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import deepMerge from 'deepmerge';
import { createMigrate, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { actionChannel, call, getContext, put } from 'redux-saga/effects';
import * as r from '~/app/routes';
import createLinguoApiContext from '~/features/linguo/createSagaApiContext';
import { confirm, registerTxSaga } from '~/features/transactions/transactionsSlice';
import { PopupNotificationLevel, notify } from '~/features/ui/popupNotificationsSlice';
import { watchAllWithBuffer } from '~/features/web3/runWithContext';
import createAsyncAction from '~/shared/createAsyncAction';
import createCancellableSaga from '~/shared/createCancellableSaga';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { compose, filter, indexBy, mapValues, prop } from '~/shared/fp';
import TaskParty from './entities/TaskParty';
import migrations from './migrations';
import singleTaskReducer, * as singleTaskSlice from './singleTaskSlice';
import taskUpdatesReducer, * as taskUpdatesSlice from './taskUpdatesSlice';

export const INTERNAL_FETCH_KEY = '@@tasks/internal';

export const create = createAsyncAction('tasks/create');
export const fetchByParty = createAsyncAction('tasks/fetchByParty');

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    loadingState: 'idle',
    error: null,
    entities: {},
    ids: [],
    updates: taskUpdatesSlice.initialState,
  },
  reducers: {
    add(state, action) {
      const { id, data } = action.payload ?? {};
      if (!id) {
        return;
      }

      state.entities[id] = deepMerge(state.entities[id], {
        loadingState: 'idle',
        data,
      });

      if (!state.ids.includes(id)) {
        state.ids.push(id);
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchByParty.fulfilled, (state, action) => {
      const tasks = compose(
        indexBy(prop('id')),
        filter(task => task.id !== undefined)
      )(action.payload?.data ?? []);

      state.loadingState = 'succeeded';
      state.entities = deepMerge(
        state.entities,
        mapValues(
          task =>
            singleTaskReducer(
              state.entities[task.id],
              singleTaskSlice.actions.fetchById.fulfilled({
                data: task,
              })
            ),
          tasks
        )
      );
      state.ids = [...new Set([...state.ids, ...Object.keys(tasks)])];
    });

    builder.addCase(fetchByParty.pending, state => {
      state.loadingState = 'loading';
    });

    builder.addCase(fetchByParty.rejected, (state, action) => {
      state.loadingState = 'failed';
      const error = action.payload?.error;

      if (error && error.name !== 'CancellationError') {
        state.error = error;
      }
    });

    builder.addMatcher(
      action => !!action?.type?.startsWith('tasks/updates/'),
      (state, action) => {
        state.updates = taskUpdatesReducer(state.updates, action);
      }
    );

    builder.addDefaultCase((state, action) => {
      const id = action.payload?.id;

      if (id) {
        state.entities[id] = singleTaskReducer(state.entities[id], action);
      }
    });
  },
});

const PERSISTANCE_KEY = 'tasks';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    storage,
    version: 2,
    migrate: createMigrate(migrations, { debug: process.env.NODE_ENV !== 'production' }),
    blacklist: [],
  };

  return persistReducer(persistConfig, reducer);
}

export default createPersistedReducer(tasksSlice.reducer);

export const { add } = tasksSlice.actions;
export const {
  fetchById,
  getChallengerDeposit,
  getTranslatorDeposit,
  getWithdrawableAmount,
  getArbitrationCost,
  assignTranslator,
  submitTranslation,
  challengeTranslation,
  approveTranslation,
  reimburseRequester,
  withdrawAllFeesAndRewards,
} = singleTaskSlice.actions;

export const {
  subscribeToUpdates,
  unsubscribeFromUpdates,
  taskCreated,
  taskAssigned,
  translationSubmitted,
  translationChallenged,
  paidAppealFee,
  taskResolved,
} = taskUpdatesSlice.actions;

export const selectAll = state => state.tasks.ids.map(id => state.tasks.entities[id].data);

export const selectById = id => state => singleTaskSlice.selectors.selectData(state.tasks.entities[id]);

export const selectAllFilterByIds = ids => state =>
  ids.reduce((acc, id) => {
    const task = state.tasks.entities[id]?.data;
    return task ? acc.concat(task) : acc;
  }, []);

export const selectIsIdle = state => state.tasks.loadingState === 'idle';
export const selectIsLoading = state => state.tasks.loadingState === 'loading';
export const selectHasSucceeded = state => state.tasks.loadingState === 'succeeded';
export const selectHasFailed = state => state.tasks.loadingState === 'failed';

export const selectError = state => state.tasks.error;

export const selectIsLoadingById = id => state => singleTaskSlice.selectors.selectIsLoading(state.tasks.entities[id]);
export const selectHasFailedById = id => state => singleTaskSlice.selectors.selectHasFailed(state.tasks.entities[id]);

export const selectErrorById = id => state => singleTaskSlice.selectors.selectError(state.tasks.entities[id]);

export function* fetchByPartySaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const apiMethodByTaskParty = {
    [TaskParty.Requester]: 'getRequesterTasks',
    [TaskParty.Translator]: 'getTranslatorTasks',
  };

  const { account, party = TaskParty.Requester, skills } = action.payload ?? {};
  const meta = action.meta ?? {};

  const method = apiMethodByTaskParty[party];
  if (!method) {
    yield put(
      fetchByParty.rejected({
        error: new Error('TaskParty should be either Requester or Translator'),
      })
    );
    return;
  }

  try {
    const data = yield call([linguoApi, method], { account, skills });
    yield put(fetchByParty.fulfilled({ data }, { meta }));
  } catch (err) {
    console.warn('Failed to fetch tasks:', err);
    yield put(fetchByParty.rejected({ error: err }, { meta }));
  }
}

export function* createSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const { account, ...rest } = action.payload ?? {};
  const { redirect, tx: metaTx, ...meta } = action.meta ?? {};

  if (!account) {
    yield put(
      notify({
        message: 'There is no requester account to use.',
        level: PopupNotificationLevel.error,
      })
    );
    return;
  }

  try {
    const { tx } = yield call([linguoApi, 'createTask'], { account, ...rest }, { from: account });

    yield call(registerTxSaga, tx, {
      ...metaTx,
      *onSuccess(resultAction) {
        if (confirm.match(resultAction)) {
          yield put(fetchByParty({ account, party: TaskParty.Requester }, { meta: { key: INTERNAL_FETCH_KEY } }));
        }
      },
    });

    yield put(create.fulfilled({}, { meta }));

    if (redirect) {
      yield put(
        push({
          pathname: r.REQUESTER_DASHBOARD,
          search: 'filter=open',
        })
      );
    }
  } catch (err) {
    yield put(create.rejected({ error: err }, { meta }));
  }
}

function* handleTaskUpdatesSaga(action) {
  const { id } = action.payload;

  yield put(fetchById({ id }));
}

const createWatchFetchByPartySaga = createWatcherSaga(
  { takeType: TakeType.latest },
  createCancellableSaga(fetchByPartySaga, fetchByParty.rejected, {
    additionalArgs: action => ({ meta: action.meta }),
  })
);

const createWatchCreateSaga = createWatcherSaga({ takeType: TakeType.leading }, createSaga);

const createWatchTaskUpdatesSaga = createWatcherSaga({ takeType: TakeType.every }, handleTaskUpdatesSaga);

export const sagas = {
  mainTasksSaga: watchAllWithBuffer(
    [
      ...singleTaskSlice.sagaDescriptors,
      ...taskUpdatesSlice.sagaDescriptors,
      [createWatchFetchByPartySaga, actionChannel(fetchByParty.type)],
      [createWatchCreateSaga, actionChannel(create.type)],
      [
        createWatchTaskUpdatesSaga,
        actionChannel(
          [taskCreated, taskAssigned, translationSubmitted, translationChallenged, paidAppealFee, taskResolved].map(
            ({ type }) => type
          )
        ),
      ],
    ],
    { createContext: createLinguoApiContext }
  ),
};
