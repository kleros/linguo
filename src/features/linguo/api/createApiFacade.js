import IArbitrator from '@kleros/erc-792/build/contracts/IArbitrator.json';
import Linguo from '@kleros/linguo-contracts/artifacts/contracts/0.7.x/Linguo.sol/Linguo.json';
import { subtract } from '~/adapters/big-number';
import { combination } from '~/adapters/js-combinatorics';
import { withProvider } from '~/app/archon';
import {
  asyncMap,
  asyncMapValues,
  compose,
  filter,
  flatten,
  indexBy,
  map,
  mapValues,
  omit,
  pick,
  prop,
  reduce,
  uniq,
} from '~/shared/fp';
import getRelevantSkills from '../getRelevantSkills';
import { getLanguageGroup, isSupportedLanguageGroupPair, LanguageGroupPair } from '../languagePairing';
import createContractApi from './createContractApi';

export default async function createApiFacade({ web3, chainId }) {
  const archon = withProvider(web3.currentProvider);

  const addressesByLanguageGroupPair = getAddressesByLanguageGroupPairs({ chainId });

  const apisByLanguageGroupPairs = await asyncMapValues(
    asyncMap(async address =>
      createApiInstance({
        web3,
        archon,
        contracts: await getLinguoContracts({ web3, chainId, address, deployment: Linguo }),
      })
    ),
    addressesByLanguageGroupPair
  );

  const apiInstancesByAddress = reduce(
    (acc, linguo) =>
      Object.assign(acc, {
        [linguo.address]: linguo.api,
      }),
    {},
    flatten(Object.values(apisByLanguageGroupPairs))
  );

  const propHandler = {
    get: (target, prop) => {
      if (target[prop]) {
        if (['createTask'].includes(prop)) {
          return new Proxy(target[prop], createTaskHandler);
        }

        if (['getTranslatorTasks'].includes(prop)) {
          return new Proxy(target[prop], getTranslatorTasksHandler);
        }

        if (['getRequesterTasks'].includes(prop)) {
          return new Proxy(target[prop], getRequesterTasksHandler);
        }

        if (['subscribe', 'subscribeToArbitrator'].includes(prop)) {
          return new Proxy(target[prop], subscribeHandler);
        }

        return new Proxy(target[prop], extractAddressFromIdHandler);
      }
    },
  };

  const createTaskHandler = {
    apply: (target, thisArg, args) => {
      const { sourceLanguage, targetLanguage } = args[0] ?? {};

      if (!sourceLanguage || !targetLanguage) {
        throw new Error('Cannot create a task without valid source and target languages');
      }

      const langGroupPair = LanguageGroupPair(getLanguageGroup(sourceLanguage), getLanguageGroup(targetLanguage));

      // By convention the first contract in the array is the one in which we add new tasks...
      const linguo = apisByLanguageGroupPairs[langGroupPair]?.[0];
      if (!linguo) {
        throw new Error(`Cannot create a task for pair (${sourceLanguage}, ${targetLanguage})`);
      }

      return linguo.api[target.name].apply(linguo.api, args);
    },
  };

  const getTranslatorTasksHandler = {
    apply: async (target, thisArg, args) => {
      const actualArgs = [omit(['skills'], args[0]), ...args.slice(1)];

      const data = await asyncMap(
        actualInstance => actualInstance[target.name].apply(actualInstance, actualArgs),
        Object.values(apiInstancesByAddress)
      );

      // const { skills } = args[0] ?? {};

      // if (!Array.isArray(skills)) {
      //   const data = await asyncMap(
      //     actualInstance => actualInstance[target.name].apply(actualInstance, args),
      //     Object.values(apiInstancesByAddress)
      //   );

      //   return flatten(data);
      // }

      // const instances = getContractInstancesForTranslator({
      //   skills,
      //   addressesByLanguageGroupPair,
      //   apiInstancesByAddress,
      // });

      // const data = await asyncMap(actualInstance => actualInstance[target.name].apply(actualInstance, args), instances);

      return flatten(data);
    },
  };

  const getRequesterTasksHandler = {
    apply: async (target, thisArg, args) => {
      const account = args?.[0]?.account;
      const hintedLanguageGroupPairs = args?.[0]?.hints?.languageGroupPairs ?? [];

      const hintedAddresses = hintedLanguageGroupPairs
        .map(languageGroupPair => addressesByLanguageGroupPair[languageGroupPair])
        .filter(addr => !!addr);

      const addresses = uniq([
        ...hintedAddresses,
        ...(await getContractAddressesForRequester({ web3, chainId, account, apiInstancesByAddress })),
      ]);

      const instances = Object.values(pick(addresses, apiInstancesByAddress));

      const data = await asyncMap(actualInstance => actualInstance[target.name].apply(actualInstance, args), instances);

      return flatten(data);
    },
  };

  const extractAddressFromIdHandler = {
    apply: async (target, thisArg, args) => {
      const ID = args?.[0]?.ID;

      if (!ID) {
        throw new Error(`To call method ${target.name} you need to provide a valid ID.`);
      }

      const [address, internalID] = String(ID).split('/');

      if (!internalID) {
        throw new Error(`To call method ${target.name} you need to provide a valid ID.`);
      }

      const [first, ...rest] = args;
      const actualArgs = [
        {
          ...first,
          ID: internalID,
        },
        ...rest,
      ];

      const actualApi = apiInstancesByAddress[address];
      if (actualApi) {
        return actualApi[target.name].apply(actualApi, actualArgs);
      }

      if (!Object.keys(readOnlyApiSkeleton).includes(target.name)) {
        throw new Error(`Task with ID ${ID} is read-only.`);
      }

      const transientInstance = await createApiInstance({
        web3,
        archon,
        contracts: await getLinguoContracts({ web3, chainId, address, deployment: Linguo }),
      });

      return transientInstance.api[target.name].apply(actualApi, actualArgs);
    },
  };

  const subscribeHandler = {
    apply: async (target, thisArg, args) => {
      return Promise.all(
        Object.values(apiInstancesByAddress).map(instance => instance[target.name].apply(instance, args))
      );
    },
  };

  return new Proxy(apiSkeleton, propHandler);
}

const apiSkeleton = {
  createTask() {},
  // Methods below fetch multiple tasks
  getRequesterTasks() {},
  getTranslatorTasks() {},
  // Methods below interact with a single task
  getTaskById() {},
  getTaskPrice() {},
  getTranslatorDeposit() {},
  getChallengerDeposit() {},
  getTaskDispute() {},
  getTaskDisputeEvidences() {},
  getWithdrawableAmount() {},
  getArbitrationCost() {},
  assignTask() {},
  submitTranslation() {},
  approveTranslation() {},
  reimburseRequester() {},
  acceptTranslation() {},
  challengeTranslation() {},
  fundAppeal() {},
  submitEvidence() {},
  withdrawAllFeesAndRewards() {},
  // Methods here require special treatment
  subscribe() {},
  subscribeToArbitrator() {},
};

const readOnlyApiSkeleton = {
  getTaskById() {},
  getTaskPrice() {},
  getTranslatorDeposit() {},
  getChallengerDeposit() {},
  getTaskDispute() {},
  getTaskDisputeEvidences() {},
  getWithdrawableAmount() {},
  getArbitrationCost() {},
};

async function getLinguoContracts({ web3, chainId, address, deployment }) {
  // set the max listeners warning threshold
  web3.eth.maxListenersWarningThreshold = 1000;

  const account = web3.eth.currentProvider.isMetaMask
    ? (await web3.eth.getAccounts())?.[0] ?? '0x0000000000000000000000000000000000000000'
    : '0x0000000000000000000000000000000000000000';

  if (!address) {
    throw new Error(`Could not find address for linguo contract on network ${chainId}`);
  }

  const linguo = new web3.eth.Contract(deployment.abi, address, { from: account });
  const arbitrator = new web3.eth.Contract(IArbitrator.abi, await linguo.methods.arbitrator().call({ from: account }));

  return { linguo, arbitrator };
}

function getAddressesByLanguageGroupPairs({ chainId }) {
  try {
    const addresses = JSON.parse(process.env.LINGUO_CONTRACT_ADDRESSES);
    return mapValues(addresses => [].concat(addresses), addresses[chainId]);
  } catch (err) {
    throw new Error('Environment variable LINGUO_CONTRACT_ADDRESSES should be a valid JSON');
  }
}

async function createApiInstance({ web3, archon, contracts }) {
  return {
    address: contracts.linguo.options.address,
    api: await createContractApi({ web3, archon, ...contracts }),
  };
}

const getUniqueLanguageGroups = compose(uniq, map(compose(getLanguageGroup, prop('language'))));

const getRelevantLanguageGroupPairs = compose(
  map(String),
  filter(isSupportedLanguageGroupPair),
  map(LanguageGroupPair.fromArray)
);

export function getContractInstancesForTranslator({ skills, addressesByLanguageGroupPair, apiInstancesByAddress }) {
  const relevantSkills = getRelevantSkills(skills);
  const allPairs = combination(getUniqueLanguageGroups(relevantSkills), 2);
  const relevantPairs = getRelevantLanguageGroupPairs([...allPairs]);

  const getUniqueAddresses = compose(uniq, flatten, Object.values, pick(relevantPairs));
  const addresses = getUniqueAddresses(addressesByLanguageGroupPair);

  return compose(Object.values, pick(addresses))(apiInstancesByAddress);
}

/**
 * Considers 1 block each 13.25 seconds on average.
 */
const BLOCK_INTERVAL_SIZE = Math.round(60 * 24 * 60 * 60 * 4.53);

const chainIdToMakeExplorerUrl = {
  1: ({ account, startBlock, endBlock, apiKey }) =>
    `https://api.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&apikey=${apiKey}`,
  42: ({ account, startBlock, endBlock, apiKey }) =>
    `https://api-kovan.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&apikey=${apiKey}`,
  77: ({ account, startBlock, endBlock }) =>
    `https://blockscout.com/poa/sokol/api?module=account&action=txlist&address=${account}&startblock=${startBlock}&endblock=${endBlock}&sort=desc`,
  100: ({ account, startBlock, endBlock }) =>
    `https://blockscout.com/xdai/mainnet/api?module=account&action=txlist&address=${account}&startblock=${startBlock}&endblock=${endBlock}&sort=desc`,
};

async function getContractAddressesForRequester({ chainId, account, web3, apiInstancesByAddress }) {
  if (!account) {
    return [];
  }

  const endBlock = await web3.eth.getBlockNumber();
  const startBlock = subtract(endBlock, BLOCK_INTERVAL_SIZE);

  const url = chainIdToMakeExplorerUrl[chainId]({
    account,
    startBlock,
    endBlock,
    apiKey: process.env.ETHERSCAN_API_KEY,
  });

  let response;
  try {
    response = await fetch(url, { mode: 'cors' });

    if (![200, 304].includes(response.status)) {
      console.warn(`Failed to fetch Linguo contracts account ${account} interacted with.`);
      return Object.keys(apiInstancesByAddress);
    }
  } catch (err) {
    console.warn(`Failed to fetch Linguo contracts account ${account} interacted with:`, err);
    return Object.keys(apiInstancesByAddress);
  }

  const { result } = await response.json();

  /**
   * Etherscan API returns addresses converted all to lowercase.
   * To actually be able to compare them, we need to convert everything to lowercase
   * and then back when returning.
   */
  const addressesLowercaseKey = indexBy(addr => String(addr).toLowerCase(), Object.keys(apiInstancesByAddress));

  return compose(
    map(lowercaseAddr => addressesLowercaseKey[lowercaseAddr]),
    uniq,
    map(prop('to')),
    filter(compose(to => prop(to, addressesLowercaseKey), prop('to')))
  )(result);
}
