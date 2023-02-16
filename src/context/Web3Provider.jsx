import React from 'react';
import PropTypes from 'prop-types';

import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core';
import { Web3Provider as EthersProvider } from '@ethersproject/providers';

const getLibrary = provider => new EthersProvider(provider);
const Web3ProviderNetwork = createWeb3ReactRoot('NETWORK');

const Web3Provider = ({ children }) => {
  return (
    <Web3ReactProvider {...{ getLibrary }}>
      <Web3ProviderNetwork {...{ getLibrary }}>{children}</Web3ProviderNetwork>
    </Web3ReactProvider>
  );
};
export default Web3Provider;

Web3Provider.propTypes = {
  children: PropTypes.node.isRequired,
};
