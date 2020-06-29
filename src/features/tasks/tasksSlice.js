import { createSlice } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { call, getContext, put, select, spawn, take } from 'redux-saga/effects';
import * as r from '~/app/routes';
import createAsyncAction from '~/features/shared/createAsyncAction';
import createCancellableSaga from '~/features/shared/createCancellableSaga';
import createWatcherSaga, { TakeType } from '~/features/shared/createWatcherSaga';
import { confirm, matchTxResult, registerTxSaga } from '~/features/transactions/transactionsSlice';
import { NotificationLevel, notify } from '~/features/ui/notificationSlice';
import { watchAllWithBuffer } from '~/features/web3/runWithContext';
import { selectChainId } from '~/features/web3/web3Slice';
import createApiFacade from './createApiFacade';
import createApiFacadePlaceholder from './createApiFacadePlaceholder';
import TaskParty from './entities/TaskParty';

export const INTERNAL_FETCH_KEY = '@@tasks/internal';

export const create = createAsyncAction('tasks/create');
export const fetchByParty = createAsyncAction('tasks/fetchByParty');
export const fetchById = createAsyncAction('tasks/fetchById');

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    loadingState: 'idle',
    entities: {},
    ids: [],
  },
  reducers: {
    add(state, action) {
      const { id } = action.payload ?? {};
      if (!id) {
        return;
      }

      state.entities[id] = action.payload;

      if (!state.ids.includes(id)) {
        state.ids.push(id);
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchByParty.fulfilled, (state, action) => {
      const tasks = action.payload?.data ?? [];
      const tasksMixin = tasks.reduce(
        (acc, task) =>
          task.id !== undefined
            ? Object.assign(acc, {
                [task.id]: task,
              })
            : acc,
        {}
      );

      Object.assign(state.entities, tasksMixin);
      state.ids = [...new Set([...state.ids, ...Object.keys(tasksMixin)])];
    });

    builder.addMatcher(
      action => /^tasks\/fetch.*\/pending$/.test(action.type),
      state => {
        state.loadingState = 'loading';
      }
    );

    builder.addMatcher(
      action => /^tasks\/fetch.*\/fulfilled$/.test(action.type),
      state => {
        state.loadingState = 'fetched';
      }
    );

    builder.addMatcher(
      action => /^tasks\/fetch.*\/rejected$/.test(action.type),
      state => {
        state.loadingState = 'failed';
      }
    );
  },
});

export default tasksSlice.reducer;

export const { add } = tasksSlice.actions;

export const selectAll = state => state.tasks.ids.map(id => state.tasks.entities[id]);

export const selectById = id => state => state.tasks.entities[id];

export const selectAllFilterByIds = ids => state =>
  ids.reduce((acc, id) => {
    const task = state.tasks.entities[id];
    return task ? acc.concat(task) : acc;
  }, []);

export const selectIsIdle = state => state.tasks.loadingState === 'idle';
export const selectIsLoading = state => state.tasks.loadingState === 'loading';
export const selectHasFetched = state => state.tasks.loadingState === 'fetched';
export const selectHasFailed = state => state.tasks.loadingState === 'failed';

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
            { key: INTERNAL_FETCH_KEY }
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
    additionalArgs: action => ({ key: action.meta?.key }),
  })
);
const createWatchCreateSaga = createWatcherSaga({ takeType: TakeType.leading }, createSaga);

export const sagas = {
  mainTasksSaga: watchAllWithBuffer(
    [
      [createWatchFetchByPartySaga, fetchByParty],
      [createWatchCreateSaga, create],
    ],
    {
      *createContext({ library: web3 }) {
        const chainId = yield select(selectChainId);

        if (!chainId || !web3) {
          return { linguoApi: yield call(createApiFacadePlaceholder) };
        }

        try {
          return { linguoApi: yield call(createApiFacade, { web3, chainId }) };
        } catch (err) {
          console.warn('Failed to create Linguo API Facade', err);
          return { linguoApi: yield call(createApiFacadePlaceholder) };
        }
      },
    }
  ),
};
