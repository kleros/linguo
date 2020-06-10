import { createHooks, getErrorMessage } from '~/adapters/web3React';
import { injected, network, fortmatic } from './connectors';

export { useWeb3React } from '@web3-react/core';

export { getErrorMessage };

export const {
  useConnectToProvider,
  useDisconnectFromProvider,
  useSyncToStore,
  useDefaultConnection,
  useEagerWalletConnection,
  useInactiveListener,
} = createHooks({
  connectors: {
    injected,
    network,
    fortmatic,
  },
});
