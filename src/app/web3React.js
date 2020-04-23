import { createHooks } from '~/adapters/web3React';
import { injected, network, fortmatic } from './connectors';
import AppContext from './AppContext';

export const { useWeb3React, useDefaultConnection, useEagerWalletConnection, useInactiveListener } = createHooks({
  AppContext,
  connectors: {
    injected,
    network,
    fortmatic,
  },
});
