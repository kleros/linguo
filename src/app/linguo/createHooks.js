import { useContext, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { Linguo, LinguoToken, Arbitrator } from '@kleros/contract-deployments/linguo';
import createError from '~/utils/createError';
import createApiFacade from './createApiFacade';

const methodPlaceholder = async () => {
  throw new Error(`API not properly initialized.
    Did you forget to wrap the calling component into a <LinguoApiReadyGateway> component?`);
};

const methodHandler = {
  apply: (target, thisArg, argumentList) => {
    return methodPlaceholder(argumentList);
  },
};

const apiPlaceholder = new Proxy(
  {},
  {
    get: () => new Proxy(() => {}, methodHandler),
  }
);

const createApiInstance = async ({ web3, chainId }) => {
  if (!web3 || !chainId) {
    return {
      tag: 'uninitialized',
      error: new Error('Web3 not initialized yet'),
      api: apiPlaceholder,
    };
  }

  const linguoAddress = Linguo.networks[chainId].address;
  const linguoTokenAddress = LinguoToken.networks[chainId].address;

  if (!linguoAddress || !linguoAddress) {
    return {
      tag: 'error',
      error: new Error(`Linguo contract has no linguoAddress for network ${chainId}`),
      api: apiPlaceholder,
    };
  }

  try {
    const linguo = new web3.eth.Contract(Linguo.abi, linguoAddress);
    const linguoArbitratorAddress = await linguo.methods.arbitrator().call();
    const linguoArbitrator = new web3.eth.Contract(Arbitrator.abi, linguoArbitratorAddress);

    const linguoToken = new web3.eth.Contract(LinguoToken.abi, linguoTokenAddress);
    const linguoTokenArbitratorAddress = await linguoToken.methods.arbitrator().call();
    const linguoTokenArbitrator = new web3.eth.Contract(Arbitrator.abi, linguoTokenArbitratorAddress);

    return {
      tag: 'ready',
      error: null,
      api: createApiFacade({
        web3,
        withEtherPayments: {
          linguo,
          arbitrator: linguoArbitrator,
        },
        withTokenPayments: {
          linguo: linguoToken,
          arbitrator: linguoTokenArbitrator,
        },
      }),
    };
  } catch (err) {
    console.warn('Error creating Linguo API object', err);
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
