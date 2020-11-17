import { fork, cancel, take } from 'redux-saga/effects';

export default function createCancelableSaga(saga, cancelActionCreator) {
  function* withCancellationSaga(...args) {
    const task = yield fork(saga, ...args);
    while (task.isRunning()) {
      const cancelAction = yield take(cancelActionCreator.type);
      if (args[0].meta?.groupId && cancelAction.meta?.groupId === args[0].meta?.groupId) {
        yield cancel(task);
      }
    }
  }

  Object.defineProperty(withCancellationSaga, 'name', {
    value: `cancelable(${saga.name ?? '<anonymous>'})`,
  });

  return withCancellationSaga;
}
