const chainIdToBaseUrl = {
  1: 'https://etherscan.io',
  77: 'https://blockscout.com/poa/sokol',
  100: 'https://blockscout.com/xdai/mainnet',
};

export const getBaseUrl = chainId => chainIdToBaseUrl[chainId] ?? chainIdToBaseUrl[1];

export const getAddressUrl = (chainId, address) => `${getBaseUrl(chainId)}/address/${address}`;

export const getTransactionUrl = (chainId, txHash) => `${getBaseUrl(chainId)}/tx/${txHash}`;
