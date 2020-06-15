import { createSlice } from '@reduxjs/toolkit';

const linguoSlice = createSlice({
  name: 'linguo',
  initialState: {
    tokenAddress: '0x0000000000000000000000000000000000000000',
  },
});

export default linguoSlice.reducer;

export const selectLinguoTokenAddress = state => state.linguo.tokenAddress;
