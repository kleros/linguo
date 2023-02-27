import { call } from 'redux-saga/effects';
import { createApiInstance, createApiPlaceholder } from './api';
import * as dotenv from 'dotenv';
dotenv.config();

const apiBaseUrls = JSON.parse(process.env.USER_SETTINGS_API_BASE_URLS);

export default function* createSagaApiContext({ library: web3 }) {
  if (!web3) {
    return { usersApi: yield call(createApiPlaceholder) };
  }

  try {
    const chainId = yield call([web3.eth, 'getChainId']);
    const apiBaseUrl = apiBaseUrls[chainId];

    if (!apiBaseUrl) {
      console.warn(`User settings API not supported for chain ID ${chainId}`);
      return { usersApi: yield call(createApiPlaceholder) };
    }

    return {
      usersApi: yield call(createApiInstance, {
        web3,
        apiBaseUrl,
      }),
    };
  } catch (err) {
    console.warn('Failed to create E-mail Preferences API', err);
    return { usersApi: yield call(createApiPlaceholder) };
  }
}
