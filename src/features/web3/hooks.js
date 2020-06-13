import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import { createHooks } from '~/adapters/web3React';
import { changeLibrary } from './web3Slice';
import { injected, network, fortmatic } from './connectors';

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
    network,
    fortmatic,
  },
});
