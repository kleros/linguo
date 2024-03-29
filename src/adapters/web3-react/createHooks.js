import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import {
  selectCurrentConnector,
  selectActivatingConnector,
  selectIsIdle,
  selectIsConnected,
  selectIsConnecting,
  selectIsErrored,
  activate,
  deactivate,
  changeAccount,
  changeChainId,
  setError,
} from '~/features/web3/web3Slice';

const actions = {
  activate,
  deactivate,
  changeAccount,
  changeChainId,
  setError,
};

export default function createHooks({ connectors = {} } = {}) {
  if (!connectors.injected) {
    throw new Error(`
      The 'injected' connector is required.
      Please check the call to 'createHooks' from ~/adapters/web3-react module
    `);
  }

  if (!connectors.network) {
    throw new Error(`
      The 'network' connector is required.
      Please check the call to 'createHooks' from ~/adapters/web3-react module
    `);
  }

  function useConnectToProvider() {
    const { activate, setError } = useWeb3React();
    const dispatch = useDispatch();

    return useCallback(
      async connectorName => {
        const connector = connectors[connectorName];
        /**
         * WalletConnect provider doesn't work after user rejects the request the first time:
         * @see { @link https://github.com/NoahZinsmeister/web3-react/issues/217 }
         */
        if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
          connector.walletConnectProvider = undefined;
        }

        try {
          dispatch(actions.activate.start({ name: connectorName }));
          await activate(connector, undefined, true);
          dispatch(actions.activate.success({ name: connectorName }));
        } catch (err) {
          setError(err);
          dispatch(actions.activate.error({ error: err }));
        }
      },
      [dispatch, activate, setError]
    );
  }

  function useDisconnectFromProvider() {
    const { connector, deactivate } = useWeb3React();
    const dispatch = useDispatch();

    return useCallback(() => {
      if (connector instanceof WalletConnectConnector) {
        /**
         * Cleans up wallet connect, otherwise it won't show the QR code when connecting again.
         */
        window.localStorage.removeItem('walletconnect');
      }

      deactivate();
      dispatch(actions.deactivate());
    }, [dispatch, connector, deactivate]);
  }

  function useSyncToStore() {
    const { account, chainId, error, connector } = useWeb3React();
    const hasConnector = !!connector;
    const dispatch = useDispatch();

    useEffect(() => {
      if (hasConnector) {
        dispatch(actions.changeAccount({ account }));
        dispatch(actions.changeChainId({ chainId }));
        dispatch(actions.setError({ error }));
      }
    }, [dispatch, hasConnector, account, chainId, error]);
  }

  function useDefaultConnection() {
    const isIdle = useSelector(selectIsIdle);

    const connect = useConnectToProvider();

    useEffect(() => {
      if (isIdle) {
        connect('network');
      }
    }, [isIdle, connect]);
  }

  function useEagerWalletConnection({ skip = false } = {}) {
    const isConnected = useSelector(selectIsConnected);
    const isErrored = useSelector(selectIsErrored);
    const isConnecting = useSelector(selectIsConnecting);
    const currentConnector = useSelector(selectCurrentConnector);
    const activatingConnector = useSelector(selectActivatingConnector);

    const connect = useConnectToProvider();
    const { active } = useWeb3React();

    useComonentDidMount(() => {
      if (skip || active) {
        return;
      }

      if ((isConnected || isErrored) && currentConnector) {
        connect(currentConnector);
      }

      if (isConnecting && activatingConnector) {
        connect(activatingConnector);
      }
    });
  }

  function useInactiveListener({ suppress = false } = {}) {
    const { active, activatingConnector, error, activate } = useWeb3React();

    const hasActivatingConnector = !!activatingConnector;
    suppress = suppress || hasActivatingConnector;

    useEffect(() => {
      const { ethereum } = window;

      if (ethereum && ethereum.on && !active && !error && !suppress) {
        const handleConnect = () => {
          console.info("Handling 'connect' event");
          activate(connectors.injected);
        };

        const handleChainChanged = chainId => {
          console.info("Handling 'chainChanged' event with payload", chainId);
          activate(connectors.injected);
        };

        const handleAccountsChanged = (accounts = []) => {
          console.info("Handling 'accountsChanged' event with payload", accounts);
          if (accounts.length > 0) {
            activate(connectors.injected);
          }
        };

        ethereum.on('connect', handleConnect);
        ethereum.on('chainChanged', handleChainChanged);
        ethereum.on('accountsChanged', handleAccountsChanged);

        return () => {
          if (ethereum.removeListener) {
            ethereum.removeListener('connect', handleConnect);
            ethereum.removeListener('chainChanged', handleChainChanged);
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
          }
        };
      }
    });
  }

  function useWeb3ReactBootstrap() {
    useSyncToStore();
    useDefaultConnection();
    useEagerWalletConnection();
    useInactiveListener();
  }

  return {
    useConnectToProvider,
    useDisconnectFromProvider,
    useWeb3ReactBootstrap,
  };
}

function useComonentDidMount(fn) {
  useEffect(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
