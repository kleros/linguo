import { call } from 'redux-saga/effects';
import { createApiInstance, createApiPlaceholder } from './api';

const apiBaseUrl = process.env.USER_SETTINGS_API_BASE_URL;

export default function* createSagaApiContext({ library: web3 }) {
  if (!web3) {
    return { usersApi: yield call(createApiPlaceholder) };
  }

  try {
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
