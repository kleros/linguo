import { createAction, createSlice } from '@reduxjs/toolkit';
import produce from 'immer';
import { takeEvery, put } from 'redux-saga/effects';
import { remove as globalRemoveTx } from './transactionsSlice';

export default function createSliceWithTransactions({ name, initialState, reducers, extraReducers = {} }) {
  const txsKey = '@@txs';

  const addTx = createAction(`${name}/${txsKey}/add`);
  const removeTx = createAction(`${name}/${txsKey}/remove`);

  const newInitialState = produce(initialState, draft => {
    draft[txsKey] = [];
  });

  const slice = createSlice({
    name,
    initialState: newInitialState,
    reducers,
    extraReducers: builder => {
      if (typeof extraReducers === 'function') {
        extraReducers(builder);
      } else {
        Object.entries(extraReducers).forEach(([type, reducer]) => {
          builder.addCase(type, reducer);
        });
      }

      builder.addCase(addTx, (state, action) => {
        const { txHash } = action.payload ?? {};

        if (txHash) {
          state[txsKey].push(txHash);
        }
      });

      builder.addCase(removeTx, (state, action) => {
        const { txHash } = action.payload ?? {};
        state[txsKey] = state[txsKey].filter(item => item !== txHash);
      });
    },
  });

  const selectAllTxs = state => state[txsKey] ?? [];

  function* watchRemoveTx() {
    yield takeEvery(`${globalRemoveTx}`, removeTxSaga);
  }

  function* removeTxSaga(action) {
    const { txHash } = action.payload ?? {};
    yield put(removeTx({ txHash }));
  }

  return {
    ...slice,
    actions: {
      ...slice.actions,
      addTx,
      removeTx,
    },
    selectors: { selectAllTxs },
    sagas: { watchRemoveTx },
  };
}
