import { useParams } from 'react-router-dom';

export const useParamsCustom = chainId => {
  const { id } = useParams();
  if (!id) return { address: '' };
  const [address, taskId] = id.split('/');

  const contractAdressesByLang = JSON.parse(process.env.LINGUO_CONTRACT_ADDRESSES);
  let langPair = '';
  if (!chainId) return { id: 0 };
  for (const [key, value] of Object.entries(contractAdressesByLang[chainId])) {
    if (value.includes(address)) langPair = key;
  }

  return { id: `${langPair}-${taskId}`, address };
};
