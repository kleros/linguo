import { useContext, useEffect, useCallback } from 'react';
import { useWeb3React as useOriginalWeb3React } from '@web3-react/core';

export default function createHooks({ AppContext, connectors: { injected } = {} } = {}) {
  if (!injected) {
    throw new Error(`
      The 'inected' connector is required.
      Please check the call to 'createHooks' from ~/adapters/web3React module
    `);
  }

  function useWeb3React() {
    const web3React = useOriginalWeb3React();
    const [{ activatingConnector }, patchState] = useContext(AppContext);

    const activate = useCallback(
      (connector, onError, throwErrors = false) => {
        patchState({ activatingConnector: connector });
        return web3React.activate(connector, onError, throwErrors).finally(() => {
          patchState({ activatingConnector: undefined });
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    return { ...web3React, activate, activatingConnector };
  }

  function useEagerConnection({ skip = false, connector } = {}) {
    const { activate, connector: currentConnector, error } = useWeb3React();
    const [{ activatingConnector }] = useContext(AppContext);

    const hasActivatingConnector = !!activatingConnector;
    const hasConnector = !!currentConnector;

    const shouldAttemptToConnect = !error && !hasConnector && !hasActivatingConnector && !skip && connector;

    useEffect(() => {
      if (shouldAttemptToConnect) {
        activate(connector);
      }
    }, [shouldAttemptToConnect, activate, connector]);
  }

  function useInactiveListener(suppress = false) {
    const { active, error, activate } = useWeb3React();

    useEffect(() => {
      const { ethereum } = window;

      if (ethereum && ethereum.on && !active && !error && !suppress) {
        const handleConnect = () => {
          console.log("Handling 'connect' event");
          activate(injected);
        };

        const handleChainChanged = chainId => {
          console.log("Handling 'chainChanged' event with payload", chainId);
          activate(injected);
        };

        const handleAccountsChanged = (accounts = []) => {
          console.log("Handling 'accountsChanged' event with payload", accounts);
          if (accounts.length > 0) {
            activate(injected);
          }
        };

        const handleNetworkChanged = networkId => {
          console.log("Handling 'networkChanged' event with payload", networkId);
          activate(injected);
        };

        ethereum.on('connect', handleConnect);
        ethereum.on('chainChanged', handleChainChanged);
        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('networkChanged', handleNetworkChanged);

        return () => {
          if (ethereum.removeListener) {
            ethereum.removeListener('connect', handleConnect);
            ethereum.removeListener('chainChanged', handleChainChanged);
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
            ethereum.removeListener('networkChanged', handleNetworkChanged);
          }
        };
      }
    });
  }

  return { useWeb3React, useEagerConnection, useInactiveListener };
}
