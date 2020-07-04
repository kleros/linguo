import { LinguoToken, Linguo } from '@kleros/contract-deployments/linguo';
import { selectChainId } from '~/features/web3/web3Slice';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export const selectLinguoTokenAddress = state => {
  const chainId = selectChainId(state);

  return LinguoToken.networks[chainId]?.address ?? ADDRESS_ZERO;
};

export const selectLinguoEtherAddress = state => {
  const chainId = selectChainId(state);

  return Linguo.networks[chainId]?.address ?? ADDRESS_ZERO;
};
