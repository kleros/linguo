const chainIdToNetworkShortName = {
  42: 'Kovan',
  1: 'Mainnet',
  77: 'Sokol',
  100: 'xDAI',
};

export function getNetworkShortName(chainId) {
  return chainIdToNetworkShortName[chainId] ?? '<Unknown>';
}

const chainIdToNetworkName = {
  42: 'Ethereum Kovan',
  1: 'Ethereum Mainnet',
  77: 'Sokol Testnet',
  100: 'xDAI Chain',
};

export function getNetworkName(chainId) {
  return chainIdToNetworkName[chainId] ?? '<Unknown Network>';
}
