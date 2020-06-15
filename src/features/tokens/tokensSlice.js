import { createSlice } from '@reduxjs/toolkit';
import { stdChannel } from 'redux-saga';
import { debounce, getContext, put, call } from 'redux-saga/effects';
import ipfs from '~/app/ipfs';
import { mapValues } from '~/features/shared/fp';
import createAsyncAction from '~/features/shared/createAsyncAction';
import createWatchSaga from '~/features/shared/createWatchSaga';
import { runSagasWithContext } from '~/features/web3/web3Slice';
import { registerTxSaga } from '~/features/transactions/transactionsSlice';
import createTokenApi from './tokenApi';
import fixtures from './fixtures/tokens.json';

const normalizedFixtures = mapValues(
  ([ID, name, ticker, address, logo, status, decimals]) => ({
    ID,
    name,
    ticker,
    address,
    logo: ipfs.generateUrl(logo),
    status,
    decimals,
  }),
  fixtures
);

const initialState = {
  entities: normalizedFixtures,
  all: Object.keys(normalizedFixtures),
  txs: [],
};

export const checkAllowance = createAsyncAction('tokens/checkAllowance');
export const approve = createAsyncAction('tokens/approve');

const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    addTx(state, action) {
      const { txHash } = action.payload;

      if (txHash) {
        state.txs.push(txHash);
      }
    },
  },
});

export const { addTx } = tokenSlice.actions;

export default tokenSlice.reducer;

export const selectAllTokens = state => state.tokens.all.map(key => state.tokens.entities[key]);

export const selectTokenByID = ID => state => state.tokens.entities[ID];

export const selectTokenByTicker = ticker => state =>
  Object.values(state.tokens.entities).find(token => token.ticker === ticker);

export const selectTokenByAddress = address => state =>
  Object.values(state.tokens.entities).find(token => token.address === address);

export const checkAllowanceChannel = stdChannel();

export function* checkAllowanceSaga(action) {
  const tokenApi = yield getContext('tokenApi');
  const { tokenAddress, owner, spender, amount } = action.payload;

  yield put(checkAllowanceChannel, checkAllowance.pending({ tokenAddress, owner, spender, amount }));

  try {
    yield call([tokenApi, 'checkAllowance'], { tokenAddress, owner, spender, amount });
    yield put(checkAllowanceChannel, checkAllowance.fulfilled({ tokenAddress, owner, spender, amount }));
  } catch (err) {
    yield put(checkAllowanceChannel, checkAllowance.rejected({ tokenAddress, owner, spender, amount, error: err }));
  }
}

export function* debounceCheckAllowanceSaga() {
  yield debounce(2000, checkAllowance.type, checkAllowanceSaga);
}

export function* approveSaga(action) {
  const tokenApi = yield getContext('tokenApi');
  const { tokenAddress, owner, spender, amount } = action.payload;

  const { tx } = yield call([tokenApi, 'approve'], { tokenAddress, owner, spender, amount });

  try {
    const { txHash } = yield call(registerTxSaga, tx, { wait: 0 });
    console.log(txHash);
    yield put(addTx({ txHash }));
  } catch (err) {
    console.log('ooops', err);
  }
}

export const watchApproveSaga = createWatchSaga(approveSaga, approve);

export const sagas = {
  tokensRootSaga: runSagasWithContext([debounceCheckAllowanceSaga, watchApproveSaga], {
    createContext: ({ library }) => ({
      tokenApi: createTokenApi({ library }),
    }),
  }),
};
