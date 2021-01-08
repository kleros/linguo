import { connectRouter } from 'connected-react-router';
import { persistCombineReducers } from 'redux-persist';
import { reducer as sagaThunkReducer } from 'redux-saga-thunk';
import requesterReducer from '~/features/requester/requesterSlice';
import storage from 'redux-persist/lib/storage';
import commentsReducer from '~/features/comments/commentsSlice';
import disputesReducer from '~/features/disputes/disputesSlice';
import userSettingsReducer from '~/features/users/userSettingsSlice';
import evidencesReducer from '~/features/evidences/evidencesSlice';
import notificationsReducer from '~/features/notifications/notificationsSlice';
import tasksReducer from '~/features/tasks/tasksSlice';
import tokensReducer from '~/features/tokens/tokensSlice';
import transactionsReducer from '~/features/transactions/transactionsSlice';
import translatorReducer from '~/features/translator/translatorSlice';
import uiReducer from '~/features/ui/uiSlice';
import web3Reducer from '~/features/web3/web3Slice';
import history from './history';

const persistConfig = {
  key: 'root',
  storage,
  /**
   * We don't wish to persist router state (e.g.: current route) neither redux-saga-thunk state.
   * All other blacklisted slices have their own persistance config.
   */
  blacklist: ['notifications', 'router', 'thunk', 'ui', 'users', 'web3', 'tasks', 'transactions', 'translator'],
};

export const createRootReducer = additionalReducers =>
  persistCombineReducers(persistConfig, {
    ...additionalReducers,
    router: connectRouter(history),
    thunk: sagaThunkReducer,
    comments: commentsReducer,
    disputes: disputesReducer,
    evidences: evidencesReducer,
    notifications: notificationsReducer,
    requester: requesterReducer,
    tasks: tasksReducer,
    tokens: tokensReducer,
    transactions: transactionsReducer,
    translator: translatorReducer,
    ui: uiReducer,
    users: userSettingsReducer,
    web3: web3Reducer,
  });
