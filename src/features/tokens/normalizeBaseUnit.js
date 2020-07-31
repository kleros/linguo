import { multiply, power } from '~/adapters/big-number';

/**
 * Normalize the value of a token according to the number of decimal places it has.
 *
 * @param {number | string} value The amount to convert (e.g.: 1 USDC)
 * @param {number | string} resolution The value of `decimals` property of the smart contract for that token
 * @return {string} The normalized value string representation
 */
export default function normalizeBaseUnit(value = 0, resolution = 18) {
  const { intString, decimals } = parseNumericValue(value);

  return multiply(intString, power(10, Math.max(resolution - decimals, 0)));
}

const parseNumericValue = number => {
  const [integerPart, fractionalPart = ''] = String(number).split('.');
  return {
    intString: `${integerPart}${fractionalPart}`,
    decimals: fractionalPart.length,
  };
};
