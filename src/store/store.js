import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'connected-react-router';
import actionIdMiddleware from '~/features/shared/actionIdMiddleware';
import { createRootReducer } from './rootReducer';
import rootSaga from './rootSaga';
import history from './history';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: createRootReducer(),
  middleware: [
    actionIdMiddleware,
    routerMiddleware(history),
    sagaMiddleware,
    ...getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
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
