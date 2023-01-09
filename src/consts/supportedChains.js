import * as dotenv from 'dotenv';
dotenv.config();

export const RPC_URLS = JSON.parse(process.env.JSON_RPC_URLS);

export const NETWORKS = Object.freeze({
  ethereum: 1,
  gnosis: 100,
  sokol: 77,
});

export const SUPPORTED_CHAINS = {
  [NETWORKS.ethereum]: {
    chainName: 'Ethereum Mainnet',
    shortName: 'Mainnet',
    sideChainId: false,
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: [RPC_URLS[NETWORKS.ethereum]],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  [NETWORKS.gnosis]: {
    chainName: 'Gnosis Chain',
    shortName: 'Gnosis',
    sideChain: true,
    nativeCurrency: { name: 'xDAI', symbol: 'xDAI', decimals: 18 },
    rpcUrls: [RPC_URLS[NETWORKS.xDai]],
    blockExplorerUrls: ['https://blockscout.com/xdai/mainnet'],
  },
  [NETWORKS.sokol]: {
    chainName: 'Poa Network Sokol',
    shortName: 'Sokol',
    sideChain: true,
    nativeCurrency: { name: 'Sokol POA', symbol: 'SPOA', decimals: 18 },
    rpcUrls: [RPC_URLS[NETWORKS.sokol]],
    blockExplorerUrls: ['https://blockscout.com/poa/sokol'],
  },
};

const counterPartyChainIdMap = {
  [NETWORKS.ethereum]: NETWORKS.gnosis,
  [NETWORKS.gnosis]: NETWORKS.ethereum,
};

export const SUPPORTED_CHAINIDS = Object.keys(SUPPORTED_CHAINS).map(x => parseInt(x));

export const isSupportedChain = chainId => SUPPORTED_CHAINIDS.includes(chainId);
export const isSupportedSideChain = chainId => SUPPORTED_CHAINS[chainId].sideChain;
export const getCounterPartyChainId = chainId => counterPartyChainIdMap[chainId];

export const getNetworkName = chainId => SUPPORTED_CHAINS[chainId].chainName ?? '<Unknown Network>';
export const getNetworkShortName = chainId => SUPPORTED_CHAINS[chainId].shortName ?? '<Unknown Network>';

export const getBaseUrl = chainId => SUPPORTED_CHAINS[chainId].blockExplorerUrls[0];
export const getAddressUrl = (chainId, address) => `${getBaseUrl(chainId)}/address/${address}`;
export const getTransactionUrl = (chainId, txHash) => `${getBaseUrl(chainId)}/tx/${txHash}`;
