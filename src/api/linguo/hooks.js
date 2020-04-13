import { useState, useEffect, useCallback } from 'react';
import { Linguo } from '@kleros/contract-deployments';
import createError from '~/utils/createError';
import createApi from './createApi';

const methodPlaceholder = async () => {
  throw new Error('API not properly initialized. Did you forget to wrap the component into <RequiredWeb3Gateway>?');
};

const methodHandler = {
  apply: (target, thisArg, argumentList) => {
    return methodPlaceholder(argumentList);
  },
};

const apiPlaceholder = new Proxy(createApi({ contract: undefined }), {
  get: (target, prop, receiver) => {
    const value = target[prop];

    return typeof value === 'function' ? new Proxy(value.bind(receiver), methodHandler) : value;
  },
});

export function useLinguo({ web3, chainId }) {
  const getContractInstance = useCallback(() => {
    if (!web3 || !chainId) {
      return {
        error: new Error('Web3 not initialized yet'),
        api: apiPlaceholder,
      };
    }

    const address = Linguo.networks[chainId].address;
    if (!address) {
      return {
        error: new Error(`Linguo contract has no address for network ${chainId}`),
        api: apiPlaceholder,
      };
    }

    let contract;
    try {
      contract = new web3.eth.Contract(Linguo.abi, address);

      return {
        error: null,
        api: createApi({
          contract,
        }),
      };
    } catch (err) {
      return {
        error: createError('Could not create a Linguo contract instance', { cause: err }),
        api: apiPlaceholder,
      };
    }
  }, [web3, chainId]);

  const [state, setState] = useState(() => getContractInstance());

  useEffect(() => setState(getContractInstance()), [getContractInstance]);

  return state;
}
