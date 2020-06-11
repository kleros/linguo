import React from 'react';
import t from 'prop-types';
import { useWeb3React } from '~/features/web3';

function renderAddress({ address }) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

const etherscanChainIdPrefixMap = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.',
};

function EthAddress({ address, children, render, className }) {
  const { chainId } = useWeb3React();
  const subdomainPrefix = etherscanChainIdPrefixMap[chainId] || '';
  return (
    <a
      href={`https://${subdomainPrefix}etherscan.io/address/${address}`}
      rel="noopener noreferrer"
      target="_blank"
      className={className}
    >
      {children || render({ address })}
    </a>
  );
}

EthAddress.propTypes = {
  address: t.string,
  children: t.node,
  render: t.func,
  className: t.string,
};

EthAddress.defaultProps = {
  address: '0x0000000000000000000000000000000000000000',
  children: null,
  render: renderAddress,
  className: '',
};

export default EthAddress;
