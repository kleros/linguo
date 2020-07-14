import { createSlice } from '@reduxjs/toolkit';

export const initialState = {};

const preferencesSlice = createSlice({
  name: 'ui/preferences',
  initialState,
  reducers: {
    set(state, action) {
      const { key, value } = action.payload;

      state[key] = value;
    },
  },
});

export default preferencesSlice.reducer;

export const actions = preferencesSlice.actions;

export const selectors = {
  selectByKey: key => state => state?.[key],
};
