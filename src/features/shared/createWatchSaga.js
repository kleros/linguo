import { takeEvery, takeLatest } from 'redux-saga/effects';

export const TakeType = {
  every: 'every',
  latest: 'latest',
};

const takeTypeEffectMap = {
  every: takeEvery,
  latest: takeLatest,
};

export default function createWatchSaga(saga, actionType, { takeType = 'every', additionalArgs = [] } = {}) {
  const effect = takeTypeEffectMap[takeType];
  if (!effect) {
    throw new Error(`Unknown take type "${takeType}". Should be one of ${Object.keys(takeTypeEffectMap)}.`);
  }
  const watchSaga = function* watchSaga() {
    yield effect(`${actionType}`, saga, ...additionalArgs);
  };

  const sagaName = saga.displayName ?? saga.name ?? 'anonymous';
  return Object.defineProperty(watchSaga, 'name', { value: `watch(${sagaName})` });
}
