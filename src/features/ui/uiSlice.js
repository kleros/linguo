import { combineReducers } from '@reduxjs/toolkit';
import notificationReducer from './notificationSlice';

export { sagas } from './notificationSlice';

export default combineReducers({
  notification: notificationReducer,
});
