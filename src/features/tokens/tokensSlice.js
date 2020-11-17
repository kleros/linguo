import { createSlice, createAction } from '@reduxjs/toolkit';
import { call, delay, put } from 'redux-saga/effects';
import createAsyncAction from '~/shared/createAsyncAction';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import createCancellableSaga from '~/shared/createCancellableSaga';
import { getEthPrice } from './tokensApi';

const prepare = (payload, rest = {}) => ({ payload, ...rest });

export const subscribeToEthPrice = createAction('tokens/ethPrice/subscribe', prepare);
export const unsubscribeFromEthPrice = createAction('tokens/ethPrice/unsubscribe', prepare);
export const fetchEthPrice = createAsyncAction('tokens/fetchEthPrice');

export const initialState = {
  ethPrice: {
    byChainId: {
      42: {
        state: 'idle',
        value: 0,
        error: null,
      },
      1: {
        state: 'idle',
        value: 0,
        error: null,
      },
    },
  },
};

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  extraReducers: builder => {
    builder.addCase(fetchEthPrice.pending, (state, action) => {
      const chainId = action.payload?.chainId;
      if (state.ethPrice.byChainId[chainId]) {
        state.ethPrice.byChainId[chainId].state = 'loading';
        state.ethPrice.byChainId[chainId].error = null;
      }
    });

    builder.addCase(fetchEthPrice.rejected, (state, action) => {
      const { chainId, error } = action.payload ?? {};
      if (state.ethPrice.byChainId[chainId]) {
        state.ethPrice.byChainId[chainId].state = 'error';
        state.ethPrice.byChainId[chainId].error = error;
      }
    });

    builder.addCase(fetchEthPrice.fulfilled, (state, action) => {
      const { chainId, ethPrice } = action.payload ?? {};
      if (state.ethPrice.byChainId[chainId]) {
        state.ethPrice.byChainId[chainId].state = 'idle';
        state.ethPrice.byChainId[chainId].value = ethPrice;
      }
    });
  },
});

export default tokensSlice.reducer;

export const selectEthPriceState = (state, { chainId }) => state.tokens.ethPrice.byChainId[chainId]?.state ?? 'idle';
export const selectEthPriceError = (state, { chainId }) => state.tokens.ethPrice.byChainId[chainId]?.error ?? null;
export const selectEthPrice = (state, { chainId }) => state.tokens.ethPrice.byChainId[chainId]?.value ?? 0;

export function* fetchEthPriceSaga(action) {
  const chainId = action.payload?.chainId;
  const meta = action.meta ?? {};

  try {
    const ethPrice = yield call(getEthPrice, { chainId });
    yield put(fetchEthPrice.fulfilled({ chainId, ethPrice }, { meta }));
  } catch (error) {
    yield put(fetchEthPrice.rejected({ chainId, error }, { meta }));
  }
}

export function* subscribeToEthPriceSaga(action) {
  const { chainId, interval, immediate = false } = action.payload ?? {};

  if (immediate) {
    yield put(fetchEthPrice({ chainId }));
  }

  while (true) {
    yield delay(interval);
    yield put(fetchEthPrice({ chainId }));
  }
}

export const sagas = {
  watchFetchTaskPrice: createWatcherSaga(
    {
      takeType: TakeType.throttleByKey,
      timeout: 10000,
      selector: action => action.payload.chainId,
    },
    fetchEthPriceSaga,
    fetchEthPrice.type
  ),
  watchSubscribeToEthPrice: createWatcherSaga(
    { takeType: TakeType.every },
    createCancellableSaga(subscribeToEthPriceSaga, unsubscribeFromEthPrice, {
      additionalPayload: action => ({ chainId: action.payload?.chainId }),
      additionalArgs: action => ({ meta: action.meta }),
    }),
    subscribeToEthPrice.type
  ),
};
