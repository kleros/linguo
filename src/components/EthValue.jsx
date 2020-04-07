import React from 'react';
import t from 'prop-types';
import { useWeb3React } from '~/app/web3React';

const Units = {
  noether: 'noether',
  wei: 'wei',
  kwei: 'kwei',
  babbage: 'babbage',
  femtoether: 'femtoether',
  mwei: 'mwei',
  lovelace: 'lovelace',
  picoether: 'picoether',
  gwei: 'gwei',
  shannon: 'shannon',
  nanoether: 'nanoether',
  nano: 'nano',
  szabo: 'szabo',
  microether: 'microether',
  micro: 'micro',
  finney: 'finney',
  milliether: 'milliether',
  milli: 'milli',
  ether: 'ether',
  kether: 'kether',
  grand: 'grand',
  mether: 'mether',
  gether: 'gether',
  tether: 'tether',
};

const unitToSuffixMap = {
  wei: {
    short: 'Wei',
    long: 'Wei',
  },
  kwei: {
    short: 'kWei',
    long: 'kWei',
  },
  mwei: {
    short: 'MWei',
    long: 'MWei',
  },
  gwei: {
    short: 'GWei',
    long: 'GWei',
  },
  micro: {
    short: 'μETH',
    long: 'μEther',
  },
  milli: {
    short: 'mETH',
    long: 'mEther',
  },
  milliether: {
    short: 'mETH',
    long: 'mEther',
  },
  ether: {
    short: 'ETH',
    long: 'Ether',
  },
};

function EthValue({ amount, unit, suffixType }) {
  const { active, library: web3 } = useWeb3React();
  const isReady = active && !!web3;

  if (!isReady) {
    return null;
  }

  const value = web3.eth.utils.fromWei(amount, unit);
  const unitSuffix = unitToSuffixMap[unit][suffixType];
  const suffix = unitSuffix ? ` ${unitSuffix}` : '';

  return (
    <>
      `${value}${suffix}`
    </>
  );
}

EthValue.propTypes = {
  amount: t.oneOfType([t.string, t.number]).isRequired,
  unit: t.oneOf[Object.values(Units)],
  suffixType: t.oneOf(['none', 'short', 'long']),
};

EthValue.defaultProps = {
  unit: Units.ether,
  suffixType: 'none',
};

EthValue.Units = Units;

export default EthValue;
