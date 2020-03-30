import { createHooks } from '~/adapters/web3React';
import { injected } from '~/app/connectors';
import AppContext from '~/app/AppContext';

const { useWeb3React, useEagerConnection, useInactiveListener } = createHooks({
  AppContext,
  connectors: {
    injected,
  },
});

export { useWeb3React, useEagerConnection, useInactiveListener };
