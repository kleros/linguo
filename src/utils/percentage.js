import { BigNumber } from 'ethers';

export const percentage = (a, b, { decimals = 2 } = {}) => {
  const multiplier = BigNumber.from(10).pow(normalizeInput(decimals));
  const result = normalizeInput(a).mul(multiplier).div(normalizeInput(b));

  return result.toNumber() / 10 ** decimals;
};

const normalizeInput = val => {
  if (val instanceof BigNumber) {
    return val;
  }
  return BigNumber.from(String(typeof val === 'number' ? Math.trunc(val) : val));
};
