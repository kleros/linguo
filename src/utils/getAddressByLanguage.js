import { defaultChainId } from '~/consts/defaultChainId';
import * as dotenv from 'dotenv';
dotenv.config();

export const getAddressByLanguageAndChain = (language, chainId = defaultChainId) => {
  const contractAddresses = JSON.parse(process.env.LINGUO_CONTRACT_ADDRESSES);
  const address = contractAddresses[chainId][language][0];

  return address;
};
