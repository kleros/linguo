import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import { useQuery, useUnsetQueryParam } from '~/adapters/react-router-dom';
import { createHooks } from '~/adapters/web3-react';
import { injected, walletConnect, network } from '~/connectors';
import { changeLibrary, selectChainId, switchChain } from './web3Slice';
import { isSupportedChain } from '~/consts/supportedChains';

export const useWatchLibrary = () => {
  const dispatch = useDispatch();
  const { library } = useWeb3React();

  useEffect(() => {
    dispatch(changeLibrary({ library }));
  }, [dispatch, library]);
};

export const { useConnectToProvider, useDisconnectFromProvider, useWeb3ReactBootstrap } = createHooks({
  connectors: {
    injected,
    walletConnect,
    network,
  },
});

export function useSwitchToChainFromUrl() {
  const dispatch = useDispatch();

  const currentChainId = useSelector(selectChainId);
  const queryParams = useQuery();
  const chainIdFromUrl =
    queryParams.chainId && !isNaN(queryParams.chainId) ? Number.parseInt(queryParams.chainId) : undefined;
  const unsetQueryParam = useUnsetQueryParam();

  useEffect(() => {
    if (chainIdFromUrl === undefined || currentChainId === undefined) {
      return;
    }

    if (chainIdFromUrl === currentChainId || !isSupportedChain(chainIdFromUrl)) {
      unsetQueryParam('chainId');
    } else {
      dispatch(switchChain({ chainId: chainIdFromUrl }));
    }
  }, [unsetQueryParam, dispatch, chainIdFromUrl, currentChainId]);
}
