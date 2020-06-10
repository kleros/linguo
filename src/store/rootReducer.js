import { persistCombineReducers } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { connectRouter } from 'connected-react-router';
import translatorReducer from '~/features/translator/translatorSlice';
import uiReducer from '~/features/ui/uiSlice';
import web3Reducer from '~/features/web3/web3Slice';
import history from './history';

const persistConfig = {
  key: 'root',
  storage,
  // web3 has its own persist config, so it should be blacklisted here
  blacklist: ['router', 'ui', 'web3'],
};

export const createRootReducer = additionalReducers =>
  persistCombineReducers(persistConfig, {
    ...additionalReducers,
    translator: translatorReducer,
    ui: uiReducer,
    web3: web3Reducer,
    router: connectRouter(history),
  });
