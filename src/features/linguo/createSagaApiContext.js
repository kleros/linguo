import { select, call } from 'redux-saga/effects';
import { selectChainId } from '~/features/web3/web3Slice';
import { createApiFacade, createApiPlaceholder } from './api';

export default function* createSagaApiContext({ library: web3 }) {
  const chainId = yield select(selectChainId);

  if (!chainId || !web3) {
    return { linguoApi: yield call(createApiPlaceholder) };
  }

  try {
    return { linguoApi: yield call(createApiFacade, { web3, chainId }) };
  } catch (err) {
    console.warn('Failed to create Linguo API Facade', err);
    return { linguoApi: yield call(createApiPlaceholder) };
  }
}
