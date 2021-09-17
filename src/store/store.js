import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { routerMiddleware } from 'connected-react-router';
import { persistStore, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import { middleware as sagaThunkMiddleware } from 'redux-saga-thunk';
import { changeLibrary } from '~/features/web3/web3Slice';
import actionIdMiddleware from '~/shared/actionIdMiddleware';
import normalizeErrorMiddleware from '~/shared/normalizeErrorMiddleware';
import history from './history';
import { createRootReducer } from './rootReducer';
import rootSaga from './rootSaga';

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
    sagaThunkMiddleware,
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
    const createRootReducer = require('./rootReducer').createRootReducer;
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
