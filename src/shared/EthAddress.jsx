import React from 'react';
import t from 'prop-types';
import { useWeb3 } from '~/hooks/useWeb3';
import { getAddressUrl } from '~/consts/supportedChains';

function renderAddress({ address }) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

function EthAddress({ address, children, render, className }) {
  const { chainId } = useWeb3();
  return (
    <a href={getAddressUrl(chainId, address)} rel="noopener noreferrer" target="_blank" className={className}>
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
