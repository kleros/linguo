import { persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { connectRouter } from 'connected-react-router';
import translatorReducer from '~/features/translator/translatorSlice';
import uiReducer from '~/features/ui/uiSlice';
import web3Reducer from '~/features/web3/web3Slice';
import tokenReducer from '~/features/tokens/tokensSlice';
import linguoReducer from '~/features/linguo/linguoSlice';
import transactionsReducer from '~/features/transactions/transactionsSlice';
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
    translator: translatorReducer,
    ui: uiReducer,
    web3: web3Reducer,
    tokens: tokenReducer,
    linguo: linguoReducer,
    transactions: transactionsReducer,
    router: connectRouter(history),
  });
