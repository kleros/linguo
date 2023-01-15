import { useIPFSQuery } from './useIPFSQuery';

export const useMetaEvidenceQuery = ipfsPath => {
  const { data, isLoading, error } = useIPFSQuery(ipfsPath);

  return { metadata: data ? data.metadata : emptyMetadata, isLoading, error };
};

const emptyMetadata = {
  deadLine: 0,
  minPrice: '0',
  maxPrice: '0',
  sourceLanguage: '',
  targetLanguage: '',
  expectedQuality: '',
  title: '',
  wordCount: 0,
  originalTextUrl: '',
  originalTextFile: '',
  __v: 0,
};
