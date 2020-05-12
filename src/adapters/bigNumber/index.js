import Web3 from 'web3';

const { toBN, BN } = Web3.utils;

const normalizeInput = val => {
  if (val instanceof BN) {
    return val;
  }

  return toBN(String(typeof val === 'number' ? Math.trunc(val) : val));
};

export const add = (a, ...args) => {
  return args.reduce((acc, current) => acc.add(normalizeInput(current)), normalizeInput(a)).toString();
};

export const subtract = (a, ...args) => {
  return args.reduce((acc, current) => acc.sub(normalizeInput(current)), normalizeInput(a)).toString();
};

export const multiply = (a, ...args) => {
  return args.reduce((acc, current) => acc.mul(normalizeInput(current)), normalizeInput(a)).toString();
};

export const divide = (a, b) => {
  return normalizeInput(a).div(normalizeInput(b)).toString();
};

export const percent = (a, b, { decimals = 2 } = {}) => {
  const multiplier = toBN('10').pow(normalizeInput(decimals));
  const result = normalizeInput(a).mul(multiplier).div(normalizeInput(b));

  return result.toNumber() / 10 ** decimals;
};

export const max = (a, ...args) => {
  return args.reduce((maxVal, current) => BN.max(maxVal, normalizeInput(current)), normalizeInput(a)).toString();
};

export const min = (a, ...args) => {
  return args.reduce((minVal, current) => BN.min(minVal, normalizeInput(current)), normalizeInput(a)).toString();
};
