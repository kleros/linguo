import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import notificationsReducer, * as notifications from './notificationSlice';
import alertsReducer, * as alerts from './alertsSlice';
import preferencesReducer, * as preferences from './preferencesSlice';

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
    alerts: alertsReducer,
    notifications: notificationsReducer,
    preferences: preferencesReducer,
  })
);

const { dismiss } = alerts.actions;
const { notify, close } = notifications.actions;
const { set } = preferences.actions;

export { dismiss as dismissAlert, notify, close as closeNotification, set as setPreference };

export const selectAlertIsVisible = id => state => alerts.selectors.selectIsVisible(id)(state.ui.alerts);
export const selectPreference = key => state => preferences.selectors.selectByKey(key)(state.ui.preferences);

export const sagas = {
  ...notifications.sagas,
};
