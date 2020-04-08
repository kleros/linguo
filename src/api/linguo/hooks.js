import { useState, useEffect } from 'react';
import { Linguo } from '@kleros/contract-deployments';
import createApi from './createApi';

export function useLinguoContract({ web3, chainId }) {
  const [state, setState] = useState({
    isReady: false,
    error: undefined,
    contract: undefined,
    api: undefined,
  });

  useEffect(() => {
    if (web3 && chainId) {
      const address = Linguo.networks[chainId].address;
      if (address) {
        const contract = new web3.eth.Contract(Linguo.abi, address);
        setState({
          isReady: true,
          error: undefined,
          contract,
          api: createApi({
            contract,
          }),
        });
      } else {
        setState({
          isReady: false,
          error: new Error(`Linguo contract has no address for network ${chainId}`),
          contract: undefined,
          api: undefined,
        });
      }
    }
  }, [web3, chainId]);

  return state;
}
