import { call, debounce, getContext, put, spawn, take } from 'redux-saga/effects';
import ipfs from '~/app/ipfs';
import createAsyncAction from '~/features/shared/createAsyncAction';
import createWatcherSaga, { TakeType } from '~/features/shared/createWatcherSaga';
import { mapValues } from '~/features/shared/fp';
import createSliceWithTransactions from '~/features/transactions/createSliceWithTransactions';
import { registerTxSaga, selectByTxHash } from '~/features/transactions/transactionsSlice';
import { watchAll } from '~/features/web3/runWithContext';
import fixtures from './fixtures/tokens.json';
import createTokenApi from './tokenApi';

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
  interactions: {},
};

export const checkAllowance = createAsyncAction('tokens/checkAllowance');
export const approve = createAsyncAction('tokens/approve');

const tokensSlice = createSliceWithTransactions({
  name: 'tokens',
  initialState,
  reducers: {
    addInteraction(state, action) {
      const { key, txHash } = action.payload;
      state.interactions[key] = txHash;
    },
    removeInteraction(state, action) {
      const { key } = action.payload;
      delete state.interactions[key];
    },
  },
});

export const { addTx, removeTx, addInteraction, removeInteraction } = tokensSlice.actions;

export default tokensSlice.reducer;

export const selectAllTokens = state => state.tokens.all.map(key => state.tokens.entities[key]);

export const selectTokenByID = ID => state => state.tokens.entities[ID];

export const selectAllTxs = state => tokensSlice.selectors.selectAllTxs(state.tokens);

export const selectInteractionTx = key => state => selectByTxHash(state.tokens.interactions[key])(state);

export const selectTokenByTicker = ticker => state =>
  Object.values(state.tokens.entities).find(token => token.ticker === ticker);

export const selectTokenByAddress = address => state =>
  Object.values(state.tokens.entities).find(token => token.address === address);

export function* checkAllowanceSaga(action) {
  const tokenApi = yield getContext('tokenApi');
  const { tokenAddress, owner, spender, amount } = action.payload ?? {};
  const meta = action.meta;

  try {
    yield call([tokenApi, 'checkAllowance'], { tokenAddress, owner, spender, amount });
    yield put(
      checkAllowance.fulfilled(
        {
          tokenAddress,
          owner,
          spender,
          amount,
        },
        { meta }
      )
    );
  } catch (err) {
    yield put(
      checkAllowance.rejected(
        {
          tokenAddress,
          owner,
          spender,
          amount,
          error: err,
        },
        { meta, error: true }
      )
    );
  }
}

export function* debounceCheckAllowanceSaga() {
  yield debounce(2000, checkAllowance.type, checkAllowanceSaga);
}

export function* approveSaga(action) {
  const tokenApi = yield getContext('tokenApi');
  const { key, tokenAddress, owner, spender, amount } = action.payload;

  const { tx } = yield call([tokenApi, 'approve'], { tokenAddress, owner, spender, amount });

  try {
    const { txHash } = yield call(registerTxSaga, tx);
    yield put(addTx({ txHash }));
    yield call(trackInteraction, { key, txHash });
  } catch (err) {
    // Nothing to be done here...
  }
}

export const watchApproveSaga = createWatcherSaga({ takeType: TakeType.leading }, approveSaga, approve.type);

export const sagas = {
  ...tokensSlice.sagas,
  tokensRootSaga: watchAll([debounceCheckAllowanceSaga, watchApproveSaga], {
    *createContext({ library }) {
      return {
        tokenApi: yield call(createTokenApi, { library }),
      };
    },
  }),
};

function* trackInteraction({ key, txHash }) {
  yield put(addInteraction({ key, txHash }));

  yield spawn(function* watchRemoveInteraction() {
    while (true) {
      const removedTx = yield take(`${removeTx}`);
      if (removedTx.payload.txHash === txHash) {
        yield put(removeInteraction({ key }));
        return;
      }
    }
  });
}