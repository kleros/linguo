import { createHooks } from '~/adapters/web3React';
import { injected, network, fortmatic } from '~/app/connectors';
import AppContext from '~/app/AppContext';

const { useWeb3React, useDefaultConnection, useEagerWalletConnection, useInactiveListener } = createHooks({
  AppContext,
  connectors: {
    injected,
    network,
    fortmatic,
  },
});

export { useWeb3React, useDefaultConnection, useEagerWalletConnection, useInactiveListener };
