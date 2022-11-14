import { map, prop } from '~/shared/fp';
import { getBaseUrl } from './blockExplorer';

const env = process.env.NODE_ENV ?? 'development';

const defaultChainIdsPerEnv = {
  production: Number(process.env.DEFAULT_CHAIN_ID) ?? 100,
  development: Number(process.env.DEFAULT_CHAIN_ID) ?? 77,
};

export const defaultChainId = defaultChainIdsPerEnv[env] ?? 77;

export const jsonRpcUrls = JSON.parse(process.env.JSON_RPC_URLS);

const supportedSideChains = {
  // xDai
  100: {
    chainId: 100,
    chainName: 'Gnosis Chain',
    nativeCurrency: { name: 'xDAI', symbol: 'xDAI', decimals: 18 },
    rpcUrls: [jsonRpcUrls[100]],
    blockExplorerUrls: [getBaseUrl(100)],
  },
  // Sokol
  77: {
    chainId: 77,
    chainName: 'Sokol',
    nativeCurrency: { name: 'Sokol POA', symbol: 'SPOA', decimals: 18 },
    rpcUrls: [jsonRpcUrls[77]],
    blockExplorerUrls: [getBaseUrl(77)],
  },
};

const counterPartyChainIdMap = {
  1: 100,
  42: 77,
  77: 42,
  100: 1,
};

export function getCounterPartyChainId(chainId) {
  return counterPartyChainIdMap[chainId];
}

export const supportedChainIds = [1, 42, ...map(prop('chainId'), Object.values(supportedSideChains))];

export function getSideChainParams(sideChainId) {
  const params = supportedSideChains[sideChainId];
  if (!params) {
    throw new Error(`Unsupported side-chain ID: ${sideChainId}`);
  }
  return params;
}

export function isSupportedSideChain(chainId) {
  return supportedSideChains[chainId] !== undefined;
}

export function isSupportedChain(chainId) {
  return supportedChainIds.includes(chainId);
}
