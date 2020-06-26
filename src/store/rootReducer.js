import { connectRouter } from 'connected-react-router';
import { persistCombineReducers } from 'redux-persist';
import requesterReducer from '~/features/requester/requesterSlice';
import storage from 'redux-persist/lib/storage';
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
  // web3 has its own persist config, so it should be blacklisted here
  blacklist: ['router', 'ui', 'web3', 'tokens', 'transactions'],
};

export const createRootReducer = additionalReducers =>
  persistCombineReducers(persistConfig, {
    ...additionalReducers,
    router: connectRouter(history),
    requester: requesterReducer,
    tasks: tasksReducer,
    tokens: tokenReducer,
    transactions: transactionsReducer,
    translator: translatorReducer,
    ui: uiReducer,
    web3: web3Reducer,
  });
