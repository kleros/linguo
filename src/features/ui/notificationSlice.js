import { createSlice, createAction } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { call, put, delay, race } from 'redux-saga/effects';
import { nanoid } from 'nanoid';
import createWatchSaga from '~/features/shared/createWatchSaga';

const notificationSlice = createSlice({
  name: 'ui/notifications',
  initialState: {},
  reducers: {
    addKey: (state, action) => {
      const { key } = action.payload;
      state[key] = key;
    },
    removeKey: (state, action) => {
      const { key } = action.payload;
      delete state[key];
    },
  },
});

export default notificationSlice.reducer;

export const { addKey, removeKey } = notificationSlice.actions;
export const notify = createAction(
  'ui/notifications/notify',
  ({ duration = 10, placement = 'topRight', type = 'info', ...rest }) => ({
    payload: {
      duration,
      placement,
      type,
      ...rest,
    },
  })
);
export const close = createAction('ui/notification/close');

export function* notifySaga(action) {
  const { key, level, duration, ...rest } = action.payload;
  const method = NotificationMethods[level] ?? 'info';

  let deferred;
  const promise = new Promise(resolve => {
    deferred = resolve;
  });

  yield put(addKey({ key }));
  yield call([notification, method], {
    ...rest,
    key: key ?? action.meta?.id ?? nanoid(10),
    duration,
    onClose: () => deferred(),
  });
  yield race([delay(duration * 1000), promise]);
  yield put(close({ key }));
}

const NotificationMethods = {
  info: 'info',
  warn: 'warn',
  error: 'error',
  success: 'success',
};

export function* closeSaga(action) {
  const { key } = action.payload;

  yield call([notification, 'close'], key);
  yield put(removeKey({ key }));
}

export const sagas = {
  watchNotifiySaga: createWatchSaga(notifySaga, notify),
  watchCloseSaga: createWatchSaga(closeSaga, close),
};
