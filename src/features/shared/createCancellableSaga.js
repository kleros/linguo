import { call, cancelled, put } from 'redux-saga/effects';

export default function createCancellableSaga(saga, cancelAction, { additionalArgs = () => ({}) } = {}) {
  function* withCancellationSaga(...args) {
    try {
      yield call(saga, ...args);
    } finally {
      if (yield cancelled()) {
        const finalAdditionalArgs = typeof additionalArgs === 'function' ? additionalArgs(...args) : additionalArgs;
        yield put(cancelAction({ error: new Error('Saga was cancelled') }, finalAdditionalArgs));
      }
    }
  }

  Object.defineProperty(withCancellationSaga, 'name', {
    value: `withCancellation(${saga.name ?? '<anonymous>'})`,
  });

  return withCancellationSaga;
}
