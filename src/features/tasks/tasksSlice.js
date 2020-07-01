import { createSlice } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { call, getContext, put, spawn, take, actionChannel } from 'redux-saga/effects';
import deepMerge from 'deepmerge';
import * as r from '~/app/routes';
import createAsyncAction from '~/features/shared/createAsyncAction';
import createCancellableSaga from '~/features/shared/createCancellableSaga';
import createWatcherSaga, { TakeType } from '~/features/shared/createWatcherSaga';
import { compose, groupBy, prop, filter, mapValues } from '~/features/shared/fp';
import { confirm, matchTxResult, registerTxSaga } from '~/features/transactions/transactionsSlice';
import { NotificationLevel, notify } from '~/features/ui/notificationSlice';
import { watchAllWithBuffer } from '~/features/web3/runWithContext';
import createLinguoApiContext from '~/features/linguo/createSagaApiContext';
import TaskParty from './entities/TaskParty';
import singleTaskReducer, * as singleTaskSlice from './singleTaskSlice';

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
        groupBy(prop('id')),
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

    builder.addDefaultCase((state, action) => {
      const id = action.payload?.id;

      if (id) {
        state.entities[id] = singleTaskReducer(state.entities[id], action);
      }
    });
  },
});

export default tasksSlice.reducer;

export const { add } = tasksSlice.actions;
export const { fetchById, getChallengerDeposit, reimburseRequester } = singleTaskSlice.actions;

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
  const { key } = action.meta ?? {};

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
    yield put(fetchByParty.fulfilled({ data }, { key }));
  } catch (err) {
    console.warn(err);
    yield put(fetchByParty.rejected({ error: err }, { key }));
  }
}

export function* createSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const { account, ...rest } = action.payload ?? {};
  const redirect = action.meta?.redirect ?? true;

  if (!account) {
    yield put(
      notify({
        message: 'There is no requester account to use.',
        level: NotificationLevel.error,
      })
    );
    return;
  }

  try {
    const { tx } = yield call([linguoApi, 'createTask'], { account, ...rest }, { from: account });
    const { txHash } = yield call(registerTxSaga, tx);
    if (redirect) {
      yield put(push(r.TRANSLATION_DASHBOARD));
    }

    yield spawn(function* updateAfterTxMined() {
      // Wait until the tx is confirmed or fails
      const resultAction = yield take(matchTxResult({ txHash }));

      // If the tx is successfull, fetch the tasks again
      if (confirm.match(resultAction)) {
        yield put(
          fetchByParty(
            {
              account,
              party: TaskParty.Requester,
            },
            {
              meta: { key: INTERNAL_FETCH_KEY },
            }
          )
        );
      }
    });
  } catch (err) {
    // do nothing...
  }
}

const createWatchFetchByPartySaga = createWatcherSaga(
  { takeType: TakeType.latest },
  createCancellableSaga(fetchByPartySaga, fetchByParty.rejected, {
    additionalArgs: action => ({ meta: { key: action.meta?.key } }),
  })
);

const createWatchCreateSaga = createWatcherSaga({ takeType: TakeType.leading }, createSaga);

export const sagas = {
  mainTasksSaga: watchAllWithBuffer(
    [
      ...singleTaskSlice.sagaDescriptors,
      [createWatchFetchByPartySaga, actionChannel(fetchByParty.type)],
      [createWatchCreateSaga, actionChannel(create.type)],
    ],
    { createContext: createLinguoApiContext }
  ),
};
