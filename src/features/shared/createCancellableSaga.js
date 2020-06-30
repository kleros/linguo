import { call, cancelled, put } from 'redux-saga/effects';
import CancellationError from './CancellationError';

export default function createCancellableSaga(
  saga,
  cancelActionCreator,
  { additionalPayload = () => ({}), additionalArgs = () => ({}) } = {}
) {
  function* withCancellationSaga(...args) {
    try {
      yield call(saga, ...args);
    } finally {
      if (yield cancelled()) {
        const finalAdditionalArgs = typeof additionalArgs === 'function' ? additionalArgs(...args) : additionalArgs;
        yield put(
          cancelActionCreator(
            { error: new CancellationError('Action was cancelled'), ...additionalPayload(...args) },
            finalAdditionalArgs
          )
        );
      }
    }
  }

  Object.defineProperty(withCancellationSaga, 'name', {
    value: `withCancellation(${saga.name ?? '<anonymous>'})`,
  });

  return withCancellationSaga;
}
