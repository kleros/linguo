import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'connected-react-router';
import actionIdMiddleware from '~/features/shared/actionIdMiddleware';
import normalizeErrorMiddleware from '~/features/shared/normalizeErrorMiddleware';
import { changeLibrary } from '~/features/web3/web3Slice';
import { createRootReducer } from './rootReducer';
import rootSaga from './rootSaga';
import history from './history';

const sagaMiddleware = createSagaMiddleware();

export function runSaga(saga, ...args) {
  return sagaMiddleware.run(saga, ...args);
}

const store = configureStore({
  reducer: createRootReducer(),
  middleware: [
    actionIdMiddleware,
    normalizeErrorMiddleware,
    routerMiddleware(history),
    sagaMiddleware,
    ...getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: [changeLibrary.type, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  ],
});
export default store;

export const persistor = persistStore(store);

let sagaTask = sagaMiddleware.run(rootSaga);

// HMR setup
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./rootReducer', () => {
    console.debug('HMR reducer');
    const createRootReducer = require('./rootReducer.js').createRootReducer;
    const newRootReducer = createRootReducer();

    store.replaceReducer(newRootReducer);
  });

  module.hot.accept('./rootSaga', () => {
    console.debug('HMR saga');
    const rootSaga = require('./rootSaga').default;
    sagaTask.cancel();
    sagaTask.toPromise().then(() => {
      sagaTask = sagaMiddleware.run(function* replacedSaga() {
        yield* rootSaga;
      });
    });
  });
}
