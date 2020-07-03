import { createSlice } from '@reduxjs/toolkit';

export const initialState = {};

const translatorUiSlice = createSlice({
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

export default translatorUiSlice.reducer;

export const actions = translatorUiSlice.actions;

export const selectors = {
  selectIsVisible: id => state => state?.[id] ?? true,
};
