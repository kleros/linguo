import { injected } from '~/connectors';
import { isSupportedChain, SUPPORTED_CHAINS } from '~/consts/supportedChains';

const NOT_ADDED_CHAIN_CODE = 4902;

export const switchChain = async chainId => {
  const provider = await injected.getProvider();
  try {
    await _switchChain(provider, chainId);
  } catch (switchError) {
    if (switchError.code === NOT_ADDED_CHAIN_CODE && isSupportedChain(chainId)) {
      await addChain(provider, SUPPORTED_CHAINS[chainId.toString()]);
    } else throw switchError;
  }
};

const addChain = async (provider, { chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls }) => {
  return provider.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: '0x' + chainId.toString(16),
        chainName: chainName,
        nativeCurrency: nativeCurrency,
        rpcUrls: rpcUrls,
        blockExplorerUrls: blockExplorerUrls,
      },
    ],
  });
};

const _switchChain = async (provider, chainId) => {
  return provider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x' + chainId.toString(16) }],
  });
};
