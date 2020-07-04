import React from 'react';
import { createSlice, createAction } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { eventChannel, END } from 'redux-saga';
import { call, put, take, cancelled } from 'redux-saga/effects';
import { nanoid } from 'nanoid';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { NotificationWithLink as link } from './NotificationTemplates';

export const NotificationLevel = {
  info: 'info',
  warn: 'warn',
  error: 'error',
  success: 'success',
};

export const notify = createAction(
  'ui/notifications/notify',
  ({ key = nanoid(10), duration = 10, placement = 'bottomRight', level = 'info', ...rest }) => ({
    payload: {
      key,
      duration,
      placement,
      level,
      ...rest,
    },
  })
);
export const close = createAction('ui/notifications/close');

export const actions = { notify, close };

const notificationSlice = createSlice({
  name: 'ui/notifications',
  initialState: {},
  extraReducers: {
    [notify]: (state, action) => {
      const { key, ...rest } = action.payload;
      state[key] = rest;
    },
    [close]: (state, action) => {
      const { key } = action.payload;
      delete state[key];
    },
  },
});

export default notificationSlice.reducer;

const notificationTemplates = {
  link,
};

const createNotificationChannel = ({ method, key, template, ...params }) => {
  const Component = notificationTemplates[template?.id];
  const templatedDescriptionMixin = Component
    ? {
        description: <Component {...template?.params} />,
      }
    : {};

  return eventChannel(emit => {
    const onClose = () => emit(END);

    notification[method]({
      ...params,
      ...templatedDescriptionMixin,
      key,
      onClose,
    });

    return () => notification.close(key);
  });
};

export function* notifySaga(action) {
  const { key, level, ...rest } = action.payload;
  const method = NotificationLevel[level] ?? 'info';

  const chan = yield call(createNotificationChannel, {
    method,
    key,
    ...rest,
  });

  try {
    yield take(chan);
  } finally {
    if (yield cancelled()) {
      chan.close();
    }
    yield put(close({ key }));
  }
}

export function* closeSaga(action) {
  const { key } = action.payload;

  yield call([notification, 'close'], key);
}

export const sagas = {
  watchNotifiySaga: createWatcherSaga({ takeType: TakeType.every }, notifySaga, notify.type),
  watchCloseSaga: createWatcherSaga({ takeType: TakeType.every }, closeSaga, close.type),
};
