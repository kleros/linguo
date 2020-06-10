import { takeEvery, takeLatest } from 'redux-saga/effects';

const TakeType = {
  every: takeEvery,
  latest: takeLatest,
};

export default function createWatchSaga(saga, actionType, { takeType = 'every', additionalArgs = [] } = {}) {
  const effect = TakeType[takeType];
  if (!effect) {
    throw new Error(`Unknown take type "${takeType}". Should be one of ${Object.keys(TakeType)}.`);
  }
  const watchSaga = function* watchSaga() {
    yield effect(`${actionType}`, saga, ...additionalArgs);
  };

  const sagaName = saga.displayName || saga.name;
  return Object.defineProperty(watchSaga, name, { value: `watch(${sagaName})` });
}
