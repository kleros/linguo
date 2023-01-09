import { useEffect, useState } from 'react';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { connectors } from '~/connectors';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { useInactiveListener } from './useWeb3';

export const useConnect = () => {
  const { activate, active, deactivate, error, connector } = useWeb3React();
  const [connecting, setConnecting] = useState(false);
  const [activationError, setActivationError] = useState();
  useInactiveListener();

  const connect = async connectorName => {
    const connector = connectors[connectorName];
    /**
     * WalletConnect provider doesn't work after user rejects the request the first time:
     * @see { @link https://github.com/NoahZinsmeister/web3-react/issues/217 }
     */
    if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
      connector.walletConnectProvider = undefined;
    }

    try {
      setConnecting(true);
      await activate(connector, undefined, true);
    } catch (err) {
      setActivationError(err);
    }
    setConnecting(false);
  };

  const disconnect = () => {
    if (connector instanceof WalletConnectConnector) {
      /**
       * Cleans up wallet connect, otherwise it won't show the QR code when connecting again.
       */
      window.localStorage.removeItem('walletconnect');
    }

    deactivate();
  };

  useEffect(() => {
    if (activationError && activationError.name === UnsupportedChainIdError.name) throw activationError;
  }, [activationError]);

  return { connect, disconnect, active, connecting, error };
};
