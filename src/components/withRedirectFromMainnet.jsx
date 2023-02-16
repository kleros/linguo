import React from 'react';
import { Spin } from '~/adapters/antd';
import { NETWORKS } from '~/consts/supportedChains';

import { useWeb3 } from '~/hooks/useWeb3';

export const withRedirectFromMainnet = WrappedComponent => {
  const WithRedirectFromMainnet = props => {
    const { chainId } = useWeb3();
    const isOnMainnet = chainId === NETWORKS.ethereum;

    return isOnMainnet ? (
      <Spin $centered spinning={isOnMainnet} tip="Waiting for network redirection" />
    ) : (
      <WrappedComponent {...props} />
    );
  };
  WithRedirectFromMainnet.displayName = `withRedirectFromMainnet(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithRedirectFromMainnet;
};
