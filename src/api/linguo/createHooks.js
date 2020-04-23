import { useContext, useEffect, useMemo } from 'react';
import { Linguo } from '@kleros/contract-deployments';
import createError from '~/utils/createError';
import createApi from './createApi';

const methodPlaceholder = async () => {
  throw new Error(`API not properly initialized.
    Did you forget to wrap the calling component into a <LinguoApiReadyGateway> component?`);
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

const createApiInstance = ({ web3, chainId }) => {
  if (!web3 || !chainId) {
    return {
      tag: 'uninitialized',
      error: new Error('Web3 not initialized yet'),
      api: apiPlaceholder,
    };
  }

  const address = Linguo.networks[chainId].address;
  if (!address) {
    return {
      tag: 'error',
      error: new Error(`Linguo contract has no address for network ${chainId}`),
      api: apiPlaceholder,
    };
  }

  let contract;
  try {
    contract = new web3.eth.Contract(Linguo.abi, address);

    return {
      tag: 'ready',
      error: null,
      api: createApi({
        contract,
      }),
    };
  } catch (err) {
    return {
      tag: 'error',
      error: createError('Could not create a Linguo contract instance', { cause: err }),
      api: apiPlaceholder,
    };
  }
};

export default function createHooks({ AppContext, useWeb3React }) {
  function useCreateLinguoApiInstance() {
    const [_ignored, patchContext] = useContext(AppContext);
    const { library: web3, chainId } = useWeb3React();

    // React only to changes in chainId
    // TODO: check if there is no problem doing so
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const apiInstance = useMemo(() => createApiInstance({ web3, chainId }), [chainId]);

    useEffect(() => {
      patchContext({
        linguo: apiInstance,
      });
    }, [patchContext, apiInstance]);
  }

  function useLinguo() {
    const [{ linguo }] = useContext(AppContext);

    const defaultValue = useMemo(
      () => ({
        tag: 'error',
        error: new Error(`Linguo not initialized.
          Did you forget to call useCreateLinguoApiInstance() hook in a initializer component?
          `),
        api: apiPlaceholder,
      }),
      []
    );

    return linguo ?? defaultValue;
  }

  return { useCreateLinguoApiInstance, useLinguo };
}
