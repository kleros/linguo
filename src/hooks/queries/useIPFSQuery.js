import useSWRImmutable from 'swr/immutable';

export const useIPFSQuery = ipfsPath => {
  const { data, error } = useSWRImmutable(
    () => (ipfsPath !== undefined ? ipfsPath : false),
    async () => {
      console.log('ipfsQuery');
      if (ipfsPath) {
        return fetch(`https://ipfs.kleros.io${ipfsPath}`).then(res => res.json());
      } else throw Error;
    }
  );
  const result = data || undefined;
  return {
    data: result,
    isLoading: !error && !data,
    error: error,
  };
};
