import { selectChainId } from '~/features/web3/web3Slice';
import { LanguageGroupPair, getLanguageGroup } from './languagePairing';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

const selectAddresses = ({ sourceLanguage, targetLanguage }) => state => {
  if (!sourceLanguage || !targetLanguage) {
    return ADDRESS_ZERO;
  }

  const chainId = selectChainId(state);
  const langGroupPair = LanguageGroupPair(getLanguageGroup(sourceLanguage), getLanguageGroup(targetLanguage));

  const addresses = byChainId[chainId][langGroupPair];

  return addresses;
};

export const selectLinguoTokenAddress = ({ sourceLanguage, targetLanguage }) => state => {
  const addresses = selectAddresses({ sourceLanguage, targetLanguage })(state);
  return addresses?.linguo ?? ADDRESS_ZERO;
};

export const selectLinguoEtherAddress = ({ sourceLanguage, targetLanguage }) => state => {
  const addresses = selectAddresses({ sourceLanguage, targetLanguage })(state);
  return addresses?.linguoToken ?? ADDRESS_ZERO;
};

let byChainId = [];
try {
  byChainId = JSON.parse(process.env.LINGUO_CONTRACT_ADDRESSES);
} catch (err) {
  throw new Error('Environment variable LINGUO_CONTRACT_ADDRESSES should be a valid JSON');
}
