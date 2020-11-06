import {
  call,
  cancel,
  cancelled,
  debounce,
  delay,
  fork,
  take,
  takeEvery,
  takeLatest,
  takeLeading,
  throttle,
} from 'redux-saga/effects';
import { curry } from './fp';

export const TakeType = {
  every: 'every',
  latest: 'latest',
  latestByKey: 'latestByKey',
  leading: 'leading',
  throttle: 'throttle',
  debounceByKey: 'debounceByKey',
  debounce: 'debounce',
  throttleByKey: 'throttleByKey',
};

function createWatcherSaga({ takeType = TakeType.every, additionalArgs = [], timeout, selector }, saga, pattern) {
  if ([TakeType.throttle, TakeType.throttleByKey, TakeType.debounce, TakeType.debounceByKey].includes(takeType)) {
    if (timeout === undefined) {
      throw new Error(`Cannot use ${takeType} without specifying a timeout`);
    }
  }

  if ([TakeType.throttleByKey, TakeType.debounceByKey, TakeType.latestByKey].includes(takeType)) {
    if (selector === undefined) {
      throw new Error(`Cannot use ${takeType} without specifying a selector`);
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

const sagaFactoryByType = {
  every: ({ pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      yield takeEvery(pattern, saga, ...additionalArgs);
    },
  latest: ({ pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      yield takeLatest(pattern, saga, ...additionalArgs);
    },
  latestByKey: ({ selector, pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      const map = new Map();

      while (true) {
        const action = yield take(pattern);
        const id = selector(action);
        const hasPending = !!map.has(id);

        try {
          if (hasPending) {
            yield cancel(map.get(id));
          }

          const task = yield fork(function* () {
            yield call(saga, action, ...additionalArgs);
            map.delete(id);
          });

          map.set(id, task);
        } finally {
          if (yield cancelled()) {
            map.delete(id);
          }
        }
      }
    },
  leading: ({ pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      yield takeLeading(pattern, saga, ...additionalArgs);
    },
  throttle: ({ timeout, pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      yield throttle(timeout, pattern, saga, ...additionalArgs);
    },
  debounce: ({ timeout, pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      yield debounce(timeout, pattern, saga, ...additionalArgs);
    },
  debounceByKey: ({ timeout, selector, pattern, saga, additionalArgs }) =>
    function* watcherSaga() {
      const map = new Map();

      while (true) {
        const action = yield take(pattern);
        const id = selector(action);
        const currentTask = map.get(id);

        if (currentTask) {
          yield cancel(currentTask);
        }

        const newTask = yield fork(function* () {
          yield delay(timeout);
          map.delete(id);
          yield call(saga, action, ...additionalArgs);
        });

        map.set(id, newTask);
      }
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
