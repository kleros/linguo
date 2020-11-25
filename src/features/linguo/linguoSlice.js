import { selectChainId } from '~/features/web3/web3Slice';
import { compose, flatten, uniq } from '~/shared/fp';

export const selectAllAddresses = state => {
  const chainId = selectChainId(state);

  const byLanguageGroupPair = byChainId[chainId] ?? {};

  return compose(uniq, flatten, Object.values)(byLanguageGroupPair);
};

let byChainId = [];
try {
  byChainId = JSON.parse(process.env.LINGUO_CONTRACT_ADDRESSES);
} catch (err) {
  throw new Error('Environment variable LINGUO_CONTRACT_ADDRESSES should be a valid JSON');
}
