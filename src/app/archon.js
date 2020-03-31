import { useEffect } from 'react';
import Archon from '@kleros/archon';

const ipfsHostAddress = process.env.IPFS_HOST_ADDRESS || 'http://localhost:5001';

const archon = new Archon(undefined, ipfsHostAddress);

export default archon;

export function useSyncArchonProvider(web3) {
  const provider = web3?.currentProvider;

  useEffect(() => {
    if (provider) {
      archon.setProvider(provider);
    }
  }, [provider]);
}
