import { createSlice } from '@reduxjs/toolkit';

export const initialState = {};

const alertsSlice = createSlice({
  name: 'ui/alerts',
  initialState,
  reducers: {
    dismiss(state, action) {
      const id = action.payload?.id;

      if (id) {
        state = state ?? {};
        state[id] = false;
      }
    },
  },
});

export default alertsSlice.reducer;

export const actions = alertsSlice.actions;

export const selectors = {
  selectIsVisible: id => state => state?.[id] ?? true,
};
