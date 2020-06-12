import { createHooks } from '~/adapters/web3React';
import { injected, network, fortmatic } from './connectors';

export const { useConnectToProvider, useDisconnectFromProvider, useWeb3ReactBootstrap } = createHooks({
  connectors: {
    injected,
    network,
    fortmatic,
  },
});
