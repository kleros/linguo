import React from 'react';
import t from 'prop-types';
import Web3 from 'web3';
import FormattedNumber from './FormattedNumber';

const { fromWei, toWei, toBN } = Web3.utils;

/**
 * ATTENTION: Order declared here is important to the mechanism
 * of `getBestDisplayUnit`, because it iterates through this array
 * in order looking for the best match to display a given amount.
 */
const availableUnits = [
  { unit: 'wei', suffix: { short: 'Wei', long: 'Wei' } },
  { unit: 'kwei', suffix: { short: 'kWei', long: 'kWei' } },
  { unit: 'mwei', suffix: { short: 'MWei', long: 'MWei' } },
  { unit: 'gwei', suffix: { short: 'GWei', long: 'GWei' } },
  { unit: 'micro', suffix: { short: 'μETH', long: 'μEther' } },
  { unit: 'milli', suffix: { short: 'mETH', long: 'mEther' } },
  { unit: 'ether', suffix: { short: 'ETH', long: 'Ether' } },
  { unit: 'kether', suffix: { short: 'kETH', long: 'kEther' } },
  { unit: 'mether', suffix: { short: 'METH', long: 'MEther' } },
  { unit: 'gether', suffix: { short: 'GETH', long: 'GEther' } },
  { unit: 'tether', suffix: { short: 'TETH', long: 'TEther' } },
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
  const intDen = toBN(toWei('1', unit)).mul(toBN(String(Math.pow(10, maxIntDigits))));
  const intNum = toBN(amount);

  const isIntPartOk = intNum.div(intDen).lt(toBN('1'));

  const frDen = toBN(toWei('1', unit));
  const frNum = toBN(amount).mul(toBN(String(Math.pow(10, decimals))));

  const isFrPartOk = frNum.div(frDen).gt(toBN('0'));

  return isIntPartOk && isFrPartOk;
};

export const getBestDisplayUnit = ({ amount, maxIntDigits = 3, decimals = 2 }) => {
  const { bestFit } = availableUnits.reduce(
    ({ found, bestFit }, alternative) => {
      if (found || !canDisplay({ amount, maxIntDigits, decimals, unit: alternative.unit })) {
        return { found, bestFit };
      }

      return { found: true, bestFit: alternative };
    },
    { found: false }
  );

  return bestFit || indexedAvailableUnits.ether;
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
  const unitInfo = indexedAvailableUnits[unit] || getBestDisplayUnit({ amount, maxIntDigits, decimals });

  const value = valueOf({ amount, unit: unitInfo.unit });

  return (
    <FormattedNumber
      value={value}
      decimals={decimals}
      render={({ formattedValue }) =>
        render({ amount, value, formattedValue, suffix: unitInfo.suffix[suffixType] ?? '' })
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
