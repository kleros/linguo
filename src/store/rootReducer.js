import { connectRouter } from 'connected-react-router';
import { persistCombineReducers } from 'redux-persist';
import { reducer as sagaThunkReducer } from 'redux-saga-thunk';
import requesterReducer from '~/features/requester/requesterSlice';
import storage from 'redux-persist/lib/storage';
import disputesReducer from '~/features/disputes/disputesSlice';
import tasksReducer from '~/features/tasks/tasksSlice';
import tokenReducer from '~/features/tokens/tokensSlice';
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
  blacklist: ['router', 'thunk', 'ui', 'web3', 'tokens', 'transactions'],
};

export const createRootReducer = additionalReducers =>
  persistCombineReducers(persistConfig, {
    ...additionalReducers,
    router: connectRouter(history),
    thunk: sagaThunkReducer,
    disputes: disputesReducer,
    requester: requesterReducer,
    tasks: tasksReducer,
    tokens: tokenReducer,
    transactions: transactionsReducer,
    translator: translatorReducer,
    ui: uiReducer,
    web3: web3Reducer,
  });
