import React from 'react';
import t from 'prop-types';
import Web3 from 'web3';
import { useShallowEqualSelector } from '~/adapters/reactRedux';
import FormattedNumber from '~/shared/FormattedNumber';
import { ADDRESS_ZERO } from './constants';
import { selectTokenByAddress } from './tokensSlice';

const { fromWei, toWei } = Web3.utils;

export default function TokenValue({ address, amount, decimals, suffixType, render }) {
  const value = valueOf({ amount });

  const tokenData = useShallowEqualSelector(selectTokenByAddress(address));
  const tokenTicker = tokenData?.ticker ?? '???';
  const tokenName = tokenData?.name ?? '<Unknown>';

  const suffix = {
    none: '',
    short: tokenTicker,
    long: tokenName,
  };

  return (
    <FormattedNumber
      value={value}
      decimals={decimals}
      render={({ formattedValue }) => render({ amount, value, formattedValue, suffix: suffix[suffixType] ?? '' })}
    />
  );
}

TokenValue.propTypes = {
  address: t.string,
  amount: t.oneOfType([t.string, t.number]).isRequired,
  decimals: t.number,
  render: t.func,
  suffixType: t.oneOf(['none', 'short', 'long']),
};

TokenValue.defaultProps = {
  address: ADDRESS_ZERO,
  decimals: 2,
  render: ({ formattedValue, suffix }) => `${formattedValue} ${suffix}`.trim(),
  suffixType: 'none',
};

export const parse = ({ amount, unit = 'ether' }) => {
  amount = String(unit === 'wei' && typeof amount === 'number' ? Math.trunc(amount) : amount);
  return toWei(amount, unit);
};

export const valueOf = ({ amount, unit = 'ether' }) => {
  amount = String(typeof amount === 'number' ? Math.trunc(amount) : amount);
  return Number(fromWei(amount, unit));
};
