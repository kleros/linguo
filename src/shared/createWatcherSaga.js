import { takeEvery, takeLatest, takeLeading, throttle, take, fork, delay, call, cancelled } from 'redux-saga/effects';
import { curry } from './fp';

export const TakeType = {
  every: 'every',
  latest: 'latest',
  leading: 'leading',
  throttle: 'throttle',
  throttleByKey: 'throttleByKey',
};

const sagaFactoryByType = {
  every: ({ pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      yield takeEvery(pattern, saga, ...additionalArgs);
    },
  latest: ({ pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      yield takeLatest(pattern, saga, ...additionalArgs);
    },
  leading: ({ pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      yield takeLeading(pattern, saga, ...additionalArgs);
    },
  throttle: ({ timeout, pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      yield throttle(timeout, pattern, saga, ...additionalArgs);
    },
  throttleByKey: ({ timeout, selector, pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      const set = new Set();

      while (true) {
        const action = yield take(pattern);
        const id = selector(action);
        const throttled = set.has(id);

        try {
          if (!throttled) {
            set.add(id);

            yield fork(function* () {
              yield delay(timeout);
              set.delete(id);
            });

            yield call(saga, action, ...additionalArgs);
          }
        } finally {
          if (yield cancelled()) {
            set.delete(id);
          }
        }
      }
    },
};

function createWatcherSaga({ takeType = 'every', additionalArgs = [], timeout, selector }, saga, pattern) {
  if (takeType === 'throttle') {
    if (timeout === undefined) {
      throw new Error('Cannot use TakeType.throttle without specifying a timeout');
    }
  }

  if (takeType === 'throttleByKey') {
    if (timeout === undefined) {
      throw new Error('Cannot use TakeType.throttleByKey without specifying a timeout');
    }
    if (selector === undefined) {
      throw new Error('Cannot use TakeType.throttleByKey without specifying a selector');
    }
  }

  const factory = sagaFactoryByType[takeType];
  if (!factory) {
    throw new Error(`Unknown take type "${takeType}". Should be one of ${Object.keys(TakeType)}.`);
  }

  const watcherSaga = factory({ pattern, saga, additionalArgs, timeout, selector });

  const sagaName = saga.displayName ?? saga.name ?? 'anonymous';
  return Object.defineProperty(watcherSaga, 'name', { value: `watcher(${sagaName})` });
}

export default curry(createWatcherSaga);
