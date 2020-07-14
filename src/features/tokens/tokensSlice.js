import { createMigrate, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { call, debounce, getContext, put, spawn, take } from 'redux-saga/effects';
import ipfs from '~/app/ipfs';
import createSliceWithTransactions from '~/features/transactions/createSliceWithTransactions';
import { registerTxSaga, selectByTxHash } from '~/features/transactions/transactionsSlice';
import { watchAll } from '~/features/web3/runWithContext';
import createAsyncAction from '~/shared/createAsyncAction';
import createCancellableSaga from '~/shared/createCancellableSaga';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { mapValues } from '~/shared/fp';
import { selectChainId } from '../web3/web3Slice';
import fixtures from './fixtures/tokens.json';
import migrations from './migrations';
import createTokenApi from './tokenApi';

const PERSISTANCE_KEY = 'tokens';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    version: 1,
    storage,
    migrate: createMigrate(migrations, { debug: process.env.NODE_ENV !== 'production' }),
    blacklist: ['byChainId'],
  };

  return persistReducer(persistConfig, reducer);
}

const normalize = ([ID, name, ticker, address, logo, status, decimals]) => ({
  ID,
  name,
  ticker,
  address,
  logo: ipfs.generateUrl(logo),
  status,
  decimals,
});

const initialState = {
  nativeToken: normalize(fixtures.nativeToken),
  byChainId: mapValues(
    data => ({
      loadingState: 'idle',
      error: null,
      data: mapValues(normalize, data),
    }),
    fixtures.byChainId
  ),
  interactions: {},
};

export const fetchAll = createAsyncAction('tokens/fetchAll');
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
  extraReducers: builder => {
    builder.addCase(fetchAll.pending, (state, action) => {
      const { chainId } = action.payload ?? {};
      if (chainId) {
        state.byChainId[chainId] = state.byChainId[chainId] ?? {};
        state.byChainId[chainId].loadingState = 'loading';
        state.byChainId[chainId].error = null;
      }
    });

    builder.addCase(fetchAll.fulfilled, (state, action) => {
      const { chainId, data } = action.payload ?? {};

      if (chainId) {
        state.byChainId[chainId] = state.byChainId[chainId] ?? {};
        state.byChainId[chainId].loadingState = 'fetched';
        state.byChainId[chainId].error = null;
        state.byChainId[chainId].data = mapValues(normalize, data);
      }
    });

    builder.addCase(fetchAll.rejected, (state, action) => {
      const { chainId, error } = action.payload ?? {};

      if (error && chainId) {
        state.byChainId[chainId] = state.byChainId[chainId] ?? {};

        if (error.name === 'CancellationError') {
          state.byChainId[chainId].loadingState = 'idle';
        } else {
          state.byChainId[chainId] = state.byChainId[chainId] ?? {};
          state.byChainId[chainId].loadingState = 'failed';
          state.byChainId[chainId].error = error;
        }
      }
    });
  },
});

export const { addTx, removeTx, addInteraction, removeInteraction } = tokensSlice.actions;

export default createPersistedReducer(tokensSlice.reducer);

export const selectAllTokens = state => {
  const chainId = selectChainId(state);
  return [state.tokens?.nativeToken, ...Object.values(state.tokens?.byChainId[chainId]?.data ?? {})].filter(x => !!x);
};

export const selectTokenByTicker = ticker => state => {
  const isNativeToken = ticker === state.tokens?.nativeToken.ticker;

  return isNativeToken ? state.tokens?.nativeToken : selectAllTokens(state).find(token => token.ticker === ticker);
};

export const selectTokenByAddress = address => state => {
  const isNativeToken = address === state.tokens?.nativeToken.address;

  return isNativeToken ? state.tokens?.nativeToken : selectAllTokens(state).find(token => token.address === address);
};

export const selectAllTxs = state => tokensSlice.selectors.selectAllTxs(state.tokens);

export const selectInteractionTx = key => state => selectByTxHash(state.tokens.interactions[key])(state);

export function* fetchAllSaga(action) {
  const tokenApi = yield getContext('tokenApi');
  const { chainId } = action.payload ?? {};
  const { meta } = action;

  try {
    const data = yield call([tokenApi, 'fetchTokens'], { chainId });
    yield put(fetchAll.fulfilled({ chainId, data }, { meta }));
  } catch (err) {
    yield put(fetchAll.rejected({ chainId, error: err }, { meta }));
  }
}

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

export function* approveSaga(action) {
  const tokenApi = yield getContext('tokenApi');
  const { key, tokenAddress, owner, spender, amount } = action.payload;
  const { tx: metaTx, ...meta } = action.meta;

  const { tx } = yield call([tokenApi, 'approve'], { tokenAddress, owner, spender, amount });

  try {
    const { txHash } = yield call(registerTxSaga, tx, { ...metaTx });
    yield put(addTx({ txHash }, { meta }));
    yield call(trackInteraction, { key, txHash });
  } catch (err) {
    // Nothing to be done here...
  }
}

export const watchFetchAllSaga = createWatcherSaga(
  { takeType: TakeType.latest },
  createCancellableSaga(fetchAllSaga, fetchAll.rejected, {
    additionalPayload: action => ({ chainId: action.payload?.chainId }),
    additionalArgs: action => ({ meta: action.meta }),
  }),
  fetchAll.type
);

export function* debounceCheckAllowanceSaga() {
  yield debounce(2000, checkAllowance.type, checkAllowanceSaga);
}

export const watchApproveSaga = createWatcherSaga({ takeType: TakeType.leading }, approveSaga, approve.type);

export const sagas = {
  ...tokensSlice.sagas,
  tokensRootSaga: watchAll([watchFetchAllSaga, debounceCheckAllowanceSaga, watchApproveSaga], {
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
