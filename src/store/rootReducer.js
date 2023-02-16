import { connectRouter } from 'connected-react-router';
import { persistCombineReducers } from 'redux-persist';
import { reducer as sagaThunkReducer } from 'redux-saga-thunk';
import storage from 'redux-persist/lib/storage';
import userSettingsReducer from '~/features/users/userSettingsSlice';
import notificationsReducer from '~/features/notifications/notificationsSlice';
import tokensReducer from '~/features/tokens/tokensSlice';
import transactionsReducer from '~/features/transactions/transactionsSlice';
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
  blacklist: [
    'notifications',
    'router',
    'thunk',
    'ui',
    'users',
    'web3',
    'tasks',
    'transactions',
    'translator',
    'requester',
  ],
};

export const createRootReducer = additionalReducers =>
  persistCombineReducers(persistConfig, {
    ...additionalReducers,
    router: connectRouter(history),
    thunk: sagaThunkReducer,
    notifications: notificationsReducer,
    tokens: tokensReducer,
    transactions: transactionsReducer,
    ui: uiReducer,
    users: userSettingsReducer,
    web3: web3Reducer,
  });
