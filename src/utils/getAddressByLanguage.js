import { defaultChainId } from '~/consts/defaultChainId';

export const getAddressByLanguageAndChain = (language, chainId) => {
  if (!chainId) chainId = defaultChainId;
  const contractAddresses = JSON.parse(process.env.LINGUO_CONTRACT_ADDRESSES);
  const address = contractAddresses[chainId][language][0];
  return address;
};
