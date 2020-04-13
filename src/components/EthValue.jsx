import t from 'prop-types';
import Web3 from 'web3';

const { fromWei, toWei, toBN } = Web3.utils;

/**
 * ATTENTION: Order declared here is important to the mechanism
 * of `getBestDisplayUnit`, because it iterates through this array
 * in order looking for the best match to display a given amount.
 */
const availableUnitInfoList = [
  { unit: 'ether', suffix: { short: 'ETH', long: 'Ether' } },
  { unit: 'milli', suffix: { short: 'mETH', long: 'mEther' } },
  { unit: 'micro', suffix: { short: 'μETH', long: 'μEther' } },
  { unit: 'gwei', suffix: { short: 'GWei', long: 'GWei' } },
  { unit: 'mwei', suffix: { short: 'MWei', long: 'MWei' } },
  { unit: 'kwei', suffix: { short: 'kWei', long: 'kWei' } },
  { unit: 'wei', suffix: { short: 'Wei', long: 'Wei' } },
];

const indexedAvailableUnitInfo = availableUnitInfoList.reduce(
  (acc, info) => Object.assign(acc, { [info.unit]: info }),
  {}
);

/**
 * Check if it's possible to display a given `amount` of Wei
 * transforming it to `unit` with up to `decimals` fraction digits.
 *
 * @param {object} params The params
 * @param {string|BN} params.amount The amount of Wei
 * @param {'ether'|'milli'|'micro'|'gwei'|'mwei'|'kwei'|'wei'} params.unit The unit for display
 * @param {number} decimals The number of fractional digits.
 */
const canDisplay = ({ amount, unit, decimals }) => {
  const denominator = toBN(toWei('1', unit));
  const numerator = toBN(amount).mul(toBN(String(Math.pow(10, decimals))));

  return numerator.div(denominator).gt(toBN('0'));
};

const getBestDisplayUnit = ({ amount, decimals }) => {
  const { bestFit } = availableUnitInfoList.reduce(
    ({ found, bestFit }, alternative) => {
      if (found || !canDisplay({ amount, decimals, unit: alternative.unit })) {
        return { found, bestFit };
      }

      return { found: true, bestFit: alternative };
    },
    { found: false }
  );

  return bestFit || indexedAvailableUnitInfo.ether;
};

function EthValue({ amount, decimals, unit, suffixType, render, className }) {
  const nf = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const unitInfo = indexedAvailableUnitInfo[unit] || getBestDisplayUnit({ amount, decimals });

  const value = fromWei(amount, unitInfo.unit);
  const formattedValue = nf.format(Number(value));

  return render({ amount, value, formattedValue, suffix: unitInfo.suffix[suffixType] || '', className });
}

const defaultRender = ({ formattedValue, suffix }) => `${formattedValue} ${suffix}`.trim();

EthValue.propTypes = {
  amount: t.oneOfType([t.string, t.number]).isRequired,
  decimals: t.number,
  unit: t.oneOf(['auto', ...Object.keys(indexedAvailableUnitInfo)]),
  suffixType: t.oneOf(['none', 'short', 'long']),
  render: t.func,
  className: t.string,
};

EthValue.defaultProps = {
  decimals: 2,
  suffixType: 'none',
  render: defaultRender,
  unit: 'auto',
  className: '',
};

export default EthValue;
