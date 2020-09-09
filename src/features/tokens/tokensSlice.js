import { createMigrate, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { actionChannel, call, getContext, put, spawn, take } from 'redux-saga/effects';
import ipfs from '~/app/ipfs';
import createSliceWithTransactions from '~/features/transactions/createSliceWithTransactions';
import { registerTxSaga, selectByTxHash } from '~/features/transactions/transactionsSlice';
import { watchAllWithBuffer } from '~/features/web3/runWithContext';
import createAsyncAction from '~/shared/createAsyncAction';
import createCancellableSaga from '~/shared/createCancellableSaga';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { mapValues } from '~/shared/fp';
import { selectChainId } from '../web3/web3Slice';
import t2crFixtures from './fixtures/t2cr-tokens.json';
import migrations from './migrations';
import createTokensApi from './tokensApi';

const PERSISTANCE_KEY = 'tokens';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    storage,
    version: 2,
    migrate: createMigrate(migrations, { debug: process.env.NODE_ENV !== 'production' }),
    blacklist: ['interactions'],
  };

  return persistReducer(persistConfig, reducer);
}

const normalizeFromT2CR = ([id, name, ticker, address, logo, status, decimals]) => ({
  id,
  name,
  ticker,
  address,
  logo: ipfs.generateUrl(logo),
  status,
  decimals,
});

const initialState = {
  nativeToken: normalizeFromT2CR(t2crFixtures.nativeToken),
  supported: {
    byChainId: {
      1: {
        loadingState: 'idle',
        error: null,
        data: {},
      },
      42: {
        loadingState: 'idle',
        error: null,
        data: {},
      },
    },
  },
  others: {
    byChainId: {
      1: {},
      42: {},
    },
  },
  interactions: {},
};

export const fetchSupported = createAsyncAction('tokens/fetchSupported');
export const fetchInfo = createAsyncAction('tokens/fetchInfo');
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
    builder.addCase(fetchSupported.pending, (state, action) => {
      const { chainId } = action.payload ?? {};
      if (chainId) {
        state.supported.byChainId[chainId] = state.supported.byChainId[chainId] ?? {};
        state.supported.byChainId[chainId].loadingState = 'loading';
        state.supported.byChainId[chainId].error = null;
      }
    });

    builder.addCase(fetchSupported.fulfilled, (state, action) => {
      const { chainId, data } = action.payload ?? {};

      if (chainId) {
        state.supported.byChainId[chainId] = state.supported.byChainId[chainId] ?? {};
        state.supported.byChainId[chainId].loadingState = 'fetched';
        state.supported.byChainId[chainId].error = null;
        state.supported.byChainId[chainId].data = mapValues(normalizeFromT2CR, data);
      }
    });

    builder.addCase(fetchSupported.rejected, (state, action) => {
      const { chainId, error } = action.payload ?? {};

      if (error && chainId) {
        state.supported.byChainId[chainId] = state.supported.byChainId[chainId] ?? {};

        if (error.name === 'CancellationError') {
          state.supported.byChainId[chainId].loadingState = 'idle';
        } else {
          state.supported.byChainId[chainId] = state.supported.byChainId[chainId] ?? {};
          state.supported.byChainId[chainId].loadingState = 'failed';
          state.supported.byChainId[chainId].error = error;
        }
      }
    });

    builder.addCase(fetchInfo.pending, (state, action) => {
      const { chainId, tokenAddress } = action.payload ?? {};
      if (chainId && tokenAddress) {
        state.others.byChainId[chainId][tokenAddress] = state.others.byChainId[chainId][tokenAddress] ?? {};
        state.others.byChainId[chainId][tokenAddress].loadingState = 'loading';
        state.others.byChainId[chainId][tokenAddress].error = null;
      }
    });

    builder.addCase(fetchInfo.fulfilled, (state, action) => {
      const { chainId, tokenAddress, data } = action.payload ?? {};

      if (chainId) {
        state.others.byChainId[chainId][tokenAddress] = state.others.byChainId[chainId][tokenAddress] ?? {};
        state.others.byChainId[chainId][tokenAddress].loadingState = 'fetched';
        state.others.byChainId[chainId][tokenAddress].error = null;
        state.others.byChainId[chainId][tokenAddress].data = data;
      }
    });

    builder.addCase(fetchInfo.rejected, (state, action) => {
      const { chainId, tokenAddress, error } = action.payload ?? {};

      if (error && chainId) {
        state.others.byChainId[chainId][tokenAddress] = state.others.byChainId[chainId][tokenAddress] ?? {};

        if (error.name === 'CancellationError') {
          state.supported.byChainId[chainId][tokenAddress].loadingState = 'idle';
        } else {
          state.supported.byChainId[chainId][tokenAddress] = state.others.byChainId[chainId][tokenAddress] ?? {};
          state.supported.byChainId[chainId][tokenAddress].loadingState = 'failed';
          state.supported.byChainId[chainId][tokenAddress].error = error;
        }
      }
    });
  },
});

export const { addTx, removeTx, addInteraction, removeInteraction } = tokensSlice.actions;

export default createPersistedReducer(tokensSlice.reducer);

export const selectSupportedTokens = state => {
  const chainId = selectChainId(state);
  return [state.tokens?.nativeToken, ...Object.values(state.tokens.supported?.byChainId[chainId]?.data ?? {})].filter(
    x => !!x
  );
};

export const selectOtherTokens = state => {
  const chainId = selectChainId(state);
  return Object.values(state.tokens.others?.byChainId[chainId] ?? {})
    .map(({ data }) => data)
    .filter(x => !!x);
};

export const selectTokenByTicker = ticker => state => {
  const isNativeToken = ticker === state.tokens?.nativeToken.ticker;

  return isNativeToken
    ? state.tokens?.nativeToken
    : selectSupportedTokens(state).find(token => token.ticker === ticker) ??
        selectOtherTokens(state).find(token => token.ticker === ticker);
};

export const selectTokenByAddress = address => state => {
  const isNativeToken = address === state.tokens?.nativeToken.address;

  return isNativeToken
    ? state.tokens?.nativeToken
    : selectSupportedTokens(state).find(token => token.address === address) ??
        selectOtherTokens(state).find(token => token.address === address);
};

export const selectAllTxs = state => tokensSlice.selectors.selectAllTxs(state.tokens);

export const selectInteractionTx = key => state => selectByTxHash(state.tokens.interactions[key])(state);

export function* fetchSupportedSaga(action) {
  const tokensApi = yield getContext('tokensApi');
  const { chainId } = action.payload ?? {};
  const { meta } = action;

  try {
    const data = yield call([tokensApi, 'fetchStableCoinsFromT2CR'], { chainId });
    yield put(fetchSupported.fulfilled({ chainId, data }, { meta }));
  } catch (err) {
    yield put(fetchSupported.rejected({ chainId, error: err }, { meta }));
  }
}

export function* fetchInfoSaga(action) {
  const tokensApi = yield getContext('tokensApi');
  const { chainId, tokenAddress } = action.payload ?? {};
  const { meta } = action;

  try {
    const data = yield call([tokensApi, 'fetchTokenInfo'], { tokenAddress });
    yield put(fetchInfo.fulfilled({ chainId, tokenAddress, data }, { meta }));
  } catch (err) {
    yield put(fetchInfo.rejected({ chainId, tokenAddress, error: err }, { meta, error: true }));
  }
}

export function* checkAllowanceSaga(action) {
  const tokensApi = yield getContext('tokensApi');
  const { tokenAddress, owner, spender, amount } = action.payload ?? {};
  const meta = action.meta;

  try {
    yield call([tokensApi, 'checkAllowance'], { tokenAddress, owner, spender, amount });
    yield put(checkAllowance.fulfilled({ tokenAddress, owner, spender, amount }, { meta }));
  } catch (err) {
    yield put(checkAllowance.rejected({ tokenAddress, owner, spender, amount, error: err }, { meta, error: true }));
  }
}

export function* approveSaga(action) {
  const tokensApi = yield getContext('tokensApi');
  const { key, tokenAddress, owner, spender, amount } = action.payload;
  const { tx: metaTx, ...meta } = action.meta;

  const { tx } = yield call([tokensApi, 'approve'], { tokenAddress, owner, spender, amount });

  try {
    const { txHash } = yield call(registerTxSaga, tx, { ...metaTx });
    yield put(addTx({ txHash }, { meta }));
    yield call(trackInteraction, { key, txHash });
  } catch (err) {
    // Nothing to be done here...
  }
}

export const createWatchFetchSupportedSaga = createWatcherSaga(
  { takeType: TakeType.latest },
  createCancellableSaga(fetchSupportedSaga, fetchSupported.rejected, {
    additionalPayload: action => ({ chainId: action.payload?.chainId }),
    additionalArgs: action => ({ meta: action.meta }),
  })
);

export const createWatchFetchInfoSaga = createWatcherSaga(
  {
    takeType: TakeType.throttleByKey,
    selector: action => action.payload.tokenAddress,
    timeout: 10000,
  },
  createCancellableSaga(fetchInfoSaga, fetchInfo.rejected, {
    additionalPayload: action => ({ chainId: action.payload?.chainId }),
    additionalArgs: action => ({ meta: action.meta }),
  })
);

export const createDebounceCheckAllowanceSaga = createWatcherSaga(
  { takeType: TakeType.debounce, timeout: 2000 },
  checkAllowanceSaga
);

export const createWatchApproveSaga = createWatcherSaga({ takeType: TakeType.leading }, approveSaga);

export const sagas = {
  ...tokensSlice.sagas,
  tokensRootSaga: watchAllWithBuffer(
    [
      [createWatchFetchSupportedSaga, actionChannel(fetchSupported.type)],
      [createWatchFetchInfoSaga, actionChannel(fetchInfo.type)],
      [createDebounceCheckAllowanceSaga, actionChannel(checkAllowance.type)],
      [createWatchApproveSaga, actionChannel(approve.type)],
    ],
    {
      *createContext({ library }) {
        return {
          tokensApi: yield call(createTokensApi, { library }),
        };
      },
    }
  ),
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
