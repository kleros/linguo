import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import notificationsReducer, * as notifications from './notificationSlice';
import alertsReducer, * as alerts from './alertsSlice';

const PERSISTANCE_KEY = 'ui';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    storage,
    blacklist: ['notifications'],
  };

  return persistReducer(persistConfig, reducer);
}

export default createPersistedReducer(
  combineReducers({
    notifications: notificationsReducer,
    alerts: alertsReducer,
  })
);

const { dismiss } = alerts.actions;

export { dismiss as dismissAlert };

const { notify, close } = notifications.actions;

export { notify, close as closeNotification };

export const selectAlertIsVisible = id => state => alerts.selectors.selectIsVisible(id)(state.ui.alerts);

export const sagas = {
  ...notifications.sagas,
};
