import { useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { Linguo, Arbitrator } from '@kleros/contract-deployments/linguo';
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

const apiPlaceholder = new Proxy(createApi({}), {
  get: (target, prop, receiver) => {
    const value = target[prop];

    return typeof value === 'function' ? new Proxy(value.bind(receiver), methodHandler) : value;
  },
});

const createApiInstance = async ({ web3, chainId }) => {
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

  try {
    const linguoContract = new web3.eth.Contract(Linguo.abi, address);
    const arbitratorAddress = await linguoContract.methods.arbitrator().call();
    const arbitratorContract = new web3.eth.Contract(Arbitrator.abi, arbitratorAddress);

    return {
      tag: 'ready',
      error: null,
      api: createApi({
        web3,
        linguoContract,
        arbitratorContract,
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

    useEffect(() => {
      let cancelled = false;

      const assignApiInstance = async () => {
        if (!cancelled) {
          patchContext({
            linguo: await createApiInstance({ web3, chainId }),
          });
        }
      };

      assignApiInstance();

      return () => {
        cancelled = true;
      };
    }, [web3, chainId, patchContext]);
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

  const argumentListToApiMethodAdapter = {
    getTaskById: ([ID]) => ({ ID }),
    getTaskPrice: ([ID]) => ({ ID }),
    getTranslatorDeposit: ([ID]) => ({ ID }),
    getChallengerDeposit: ([ID]) => ({ ID }),
    getTaskDispute: ([ID]) => ({ ID }),
    getRequesterTasks: ([account]) => ({ account }),
    getTranslatorTasks: ([account, skills]) => ({ account, skills }),
  };

  const createFetcher = api => (method, ...args) => api[method](argumentListToApiMethodAdapter[method](args));

  function useCacheCall(
    [method, ...args],
    {
      suspense = false,
      initialData = undefined,
      revalidateOnFocus = true,
      revalidateOnReconnect = true,
      refreshInterval = 0,
      shouldRetryOnError = true,
    } = {}
  ) {
    /**
     * SWR does not play well with non-primitive data types,
     * so we need to JSON.stringify any objects or arrays passed as args.
     */
    const actualArgs = args.map(arg => (isPrimitive(arg) || arg === null ? arg : JSON.stringify(arg)));

    const { api } = useLinguo();
    const { data, error, isValidating, mutate } = useSWR([method, ...actualArgs], createFetcher(api), {
      suspense,
      initialData,
      revalidateOnFocus,
      revalidateOnReconnect,
      refreshInterval,
      shouldRetryOnError,
    });

    return [
      {
        data,
        error,
        isLoading: isValidating,
        isError: !!error,
        isSuccess: !isValidating && !error,
      },
      mutate,
    ];
  }

  return { useCreateLinguoApiInstance, useLinguo, useCacheCall };
}

const isPrimitive = arg => ['string', 'number', 'boolean', 'undefined', 'symbol'].includes(typeof arg);
