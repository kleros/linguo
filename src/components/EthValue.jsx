import t from 'prop-types';
import Web3 from 'web3';

const { fromWei } = Web3.utils;

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

function EthValue({ amount, decimals, unit, suffixType, render }) {
  const nf = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const value = nf.format(Number(fromWei(amount, unit)));
  const suffix = unitToSuffixMap[unit][suffixType];

  return render({ value, suffix });
}

const defaultRender = ({ value, suffix }) => `${value} ${suffix}`.trim();

EthValue.propTypes = {
  amount: t.oneOfType([t.string, t.number]).isRequired,
  decimals: t.number,
  unit: t.oneOf(Object.values(Units)),
  suffixType: t.oneOf(['none', 'short', 'long']),
  render: t.func,
};

EthValue.defaultProps = {
  decimals: 2,
  unit: Units.ether,
  suffixType: 'none',
  render: defaultRender,
};

EthValue.Units = Units;

export default EthValue;
