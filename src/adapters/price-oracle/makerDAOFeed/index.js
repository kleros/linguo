import getEthPriceUsd from './getEthPriceUsd';

export default function getPrice({ from = 'eth', to = 'usd' } = {}) {
  if (from !== 'eth') {
    throw new Error(`Unsupported conversion from ${from}`);
  }

  if (to !== 'usd') {
    throw new Error(`Unsupported conversion to ${to}`);
  }

  return getEthPriceUsd();
}
