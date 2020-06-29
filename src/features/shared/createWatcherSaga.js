import { takeEvery, takeLatest, takeLeading } from 'redux-saga/effects';
import { curry } from './fp';

export const TakeType = {
  every: 'every',
  latest: 'latest',
  leading: 'leading',
};

const takeTypeEffectMap = {
  every: takeEvery,
  latest: takeLatest,
  leading: takeLeading,
};

function createWatcherSaga({ takeType = 'every', additionalArgs = [] }, saga, channelOrActionType) {
  const effect = takeTypeEffectMap[takeType];
  if (!effect) {
    throw new Error(`Unknown take type "${takeType}". Should be one of ${Object.keys(takeTypeEffectMap)}.`);
  }

  const watchSaga = function* watchSaga() {
    yield effect(channelOrActionType, saga, ...additionalArgs);
  };

  const sagaName = saga.displayName ?? saga.name ?? 'anonymous';
  return Object.defineProperty(watchSaga, 'name', { value: `watch(${sagaName})` });
}

export default curry(createWatcherSaga);
