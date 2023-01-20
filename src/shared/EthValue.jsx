import React from 'react';
import t from 'prop-types';
import Web3 from 'web3';

import FormattedNumber from './FormattedNumber';
import { useWeb3 } from '~/hooks/useWeb3';
import { defaultChainId } from '~/consts/defaultChainId';

const DEFAULT_CHAIN_ID = process.env.DEFAULT_CHAIN_ID;

const { fromWei, toWei, toBN } = Web3.utils;

/**
 * ATTENTION: Order declared here is important to the mechanism
 * of `getBestDisplayUnit`, because it iterates through this array
 * in order looking for the best match to display a given amount.
 */
const availableUnits = [
  {
    unit: 'tether',
    chainIdToSuffixes: {
      1: { short: 'TETH', long: 'TEther' },
      5: { short: 'TETH', long: 'TEther' },
      42: { short: 'TETH', long: 'TEther' },
      77: { short: 'TSPOA', long: 'TSPOA' },
      100: { short: 'TxDAI', long: 'TxDAI' },
    },
  },
  {
    unit: 'gether',
    chainIdToSuffixes: {
      1: { short: 'GETH', long: 'GEther' },
      5: { short: 'GETH', long: 'GEther' },
      42: { short: 'GETH', long: 'GEther' },
      77: { short: 'GSPOA', long: 'GSPOA' },
      100: { short: 'GxDAI', long: 'GxDAI' },
    },
  },
  {
    unit: 'mether',
    chainIdToSuffixes: {
      1: { short: 'METH', long: 'MEther' },
      5: { short: 'METH', long: 'MEther' },
      42: { short: 'METH', long: 'MEther' },
      77: { short: 'MSPOA', long: 'MSPOA' },
      100: { short: 'MxDAI', long: 'MxDAI' },
    },
  },
  {
    unit: 'kether',
    chainIdToSuffixes: {
      1: { short: 'kETH', long: 'kEther' },
      5: { short: 'kETH', long: 'kEther' },
      42: { short: 'kETH', long: 'kEther' },
      77: { short: 'kSPOA', long: 'kSPOA' },
      100: { short: 'kxDAI', long: 'kxDAI' },
    },
  },
  {
    unit: 'ether',
    chainIdToSuffixes: {
      1: { short: 'ETH', long: 'Ether' },
      5: { short: 'ETH', long: 'Ether' },
      42: { short: 'ETH', long: 'Ether' },
      77: { short: 'SPOA', long: 'SPOA' },
      100: { short: 'xDAI', long: 'xDAI' },
    },
  },
  {
    unit: 'milli',
    chainIdToSuffixes: {
      1: { short: 'mETH', long: 'mEther' },
      5: { short: 'mETH', long: 'mEther' },
      42: { short: 'mETH', long: 'mEther' },
      77: { short: 'mSPOA', long: 'mSPOA' },
      100: { short: 'mxDAI', long: 'mxDAI' },
    },
  },
  {
    unit: 'micro',
    chainIdToSuffixes: {
      1: { short: 'μETH', long: 'μEther' },
      5: { short: 'μETH', long: 'μEther' },
      42: { short: 'μETH', long: 'μEther' },
      77: { short: 'μSPOA', long: 'μSPOA' },
      100: { short: 'μxDAI', long: 'μxDAI' },
    },
  },
  {
    unit: 'gwei',
    chainIdToSuffixes: {
      1: { short: 'GWei', long: 'GWei' },
      5: { short: 'GWei', long: 'GWei' },
      42: { short: 'GWei', long: 'GWei' },
      77: { short: 'GWei', long: 'GWei' },
      100: { short: 'GWei', long: 'GWei' },
    },
  },
  {
    unit: 'mwei',
    chainIdToSuffixes: {
      1: { short: 'MWei', long: 'MWei' },
      5: { short: 'MWei', long: 'MWei' },
      42: { short: 'MWei', long: 'MWei' },
      77: { short: 'MWei', long: 'MWei' },
      100: { short: 'MWei', long: 'MWei' },
    },
  },
  {
    unit: 'kwei',
    chainIdToSuffixes: {
      1: { short: 'kWei', long: 'kWei' },
      5: { short: 'kWei', long: 'kWei' },
      42: { short: 'kWei', long: 'kWei' },
      77: { short: 'kWei', long: 'kWei' },
      100: { short: 'kWei', long: 'kWei' },
    },
  },
  {
    unit: 'wei',
    chainIdToSuffixes: {
      1: { short: 'Wei', long: 'Wei' },
      5: { short: 'Wei', long: 'Wei' },
      42: { short: 'Wei', long: 'Wei' },
      77: { short: 'Wei', long: 'Wei' },
      100: { short: 'Wei', long: 'Wei' },
    },
  },
];

const indexedAvailableUnits = availableUnits.reduce((acc, info) => Object.assign(acc, { [info.unit]: info }), {});
const availableUnitNames = Object.keys(indexedAvailableUnits).reduce((acc, key) => Object.assign(acc, { [key]: key }), {
  auto: 'auto',
});

export { availableUnitNames as EthUnit };

/**
 * Check if it's possible to display a given `amount` of Wei
 * transforming it to `unit` with up to `decimals` fraction maxIntDigits.
 *
 * @param {object} params The params
 * @param {string|BN} params.amount The amount of Wei
 * @param {'ether'|'milli'|'micro'|'gwei'|'mwei'|'kwei'|'wei'} params.unit The unit for display
 * @param {number} decimals The number of fractional maxIntDigits.
 */
const canDisplay = ({ amount, unit, maxIntDigits, decimals }) => {
  const intNum = toBN(amount);
  if (intNum.isZero()) {
    return true;
  }

  const intDen = toBN(toWei('1', unit)).mul(toBN(String(Math.pow(10, maxIntDigits))));
  const isIntPartOk = intNum.div(intDen).lt(toBN('1'));

  const frDen = toBN(toWei('1', unit));
  const frNum = toBN(amount).mul(toBN(String(Math.pow(10, decimals))));

  const isFrPartOk = frNum.div(frDen).gt(toBN('0'));

  return isIntPartOk && isFrPartOk;
};

export const getBestDisplayUnit = ({ chainId = DEFAULT_CHAIN_ID, amount, maxIntDigits = 3, decimals = 2 }) => {
  const defaultUnit = {
    unit: indexedAvailableUnits.ether.unit,
    suffix:
      indexedAvailableUnits.ether.chainIdToSuffixes[chainId] ??
      indexedAvailableUnits.ether.chainIdToSuffixes[defaultChainId],
  };

  if (canDisplay({ amount, maxIntDigits, decimals, unit: indexedAvailableUnits.ether.unit })) {
    return defaultUnit;
  }

  const { found, bestFit } = availableUnits.reduce(
    ({ found, bestFit }, alternative) => {
      if (found || !canDisplay({ amount, maxIntDigits, decimals, unit: alternative.unit })) {
        return { found, bestFit };
      }

      return { found: true, bestFit: alternative };
    },
    { found: false }
  );

  return found
    ? {
        unit: bestFit.unit,
        suffix: bestFit.chainIdToSuffixes[chainId],
      }
    : defaultUnit;
};

export const parse = ({ amount, unit = 'ether' }) => {
  amount = String(unit === 'wei' && typeof amount === 'number' ? Math.trunc(amount) : amount);
  return toWei(amount, unit);
};

export const valueOf = ({ amount, unit = 'ether' }) => {
  amount = String(typeof amount === 'number' ? Math.trunc(amount) : amount);
  return Number(fromWei(amount, unit));
};

function EthValue({ amount, maxIntDigits, decimals, unit, suffixType, render }) {
  const { chainId } = useWeb3();
  const unitInfo = indexedAvailableUnits[unit]
    ? {
        unit,
        suffix: indexedAvailableUnits[unit].chainIdToSuffixes[chainId],
      }
    : getBestDisplayUnit({ chainId, amount, maxIntDigits, decimals });

  const value = valueOf({ amount, unit: unitInfo.unit });

  return (
    <FormattedNumber
      value={value}
      decimals={decimals}
      render={({ formattedValue }) =>
        render({ amount, value, formattedValue, suffix: unitInfo?.suffix?.[suffixType] ?? '' })
      }
    />
  );
}

const defaultRender = ({ formattedValue, suffix }) => `${formattedValue} ${suffix}`.trim();

EthValue.propTypes = {
  amount: t.oneOfType([t.string, t.number]).isRequired,
  maxIntDigits: t.number,
  decimals: t.number,
  unit: t.oneOf(Object.keys(availableUnitNames)),
  suffixType: t.oneOf(['none', 'short', 'long']),
  render: t.func,
};

EthValue.defaultProps = {
  maxIntDigits: 3,
  decimals: 2,
  suffixType: 'none',
  render: defaultRender,
  unit: availableUnitNames.auto,
};

export default EthValue;
