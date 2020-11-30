import { call } from 'redux-saga/effects';
import { createApiInstance, createApiPlaceholder } from './api';

const apiBaseUrlsByChainId = JSON.parse(process.env.USER_SETTINGS_API_BASE_URLS ?? '{}');

export default function* createSagaApiContext({ library: web3 }) {
  if (!web3) {
    return { usersApi: yield call(createApiPlaceholder) };
  }

  try {
    const chainId = yield call([web3.eth, 'getChainId']);
    return {
      usersApi: yield call(createApiInstance, {
        web3,
        apiBaseUrl: apiBaseUrlsByChainId[chainId],
      }),
    };
  } catch (err) {
    console.warn('Failed to create E-mail Preferences API', err);
    return { usersApi: yield call(createApiPlaceholder) };
  }
}
