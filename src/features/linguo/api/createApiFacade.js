import { Arbitrator, Linguo, LinguoToken } from '@kleros/contract-deployments/linguo';
import { withProvider } from '~/app/archon';
import { combination } from '~/adapters/js-combinatorics';
import {
  asyncMap,
  asyncMapValues,
  compose,
  filter,
  flatten,
  groupBy,
  map,
  mapValues,
  omit,
  pick,
  prop,
  reduce,
  uniq,
} from '~/shared/fp';
import { subtract } from '~/adapters/big-number';
import getRelevantSkills from '../getRelevantSkills';
import { getLanguageGroup, isSupportedLanguageGroupPair, LanguageGroupPair } from '../languagePairing';
import { ADDRESS_ZERO } from './constants';
import { createEthContractApi, createTokenContractApi } from './createContractApi';

const apiSkeleton = {
  createTask() {},
  // Methods bellow fetche multiple tasks
  getRequesterTasks() {},
  getTranslatorTasks() {},
  // Methods bellow interact with a single task
  getTaskById() {},
  getTaskPrice() {},
  getTranslatorDeposit() {},
  getChallengerDeposit() {},
  getTaskDispute() {},
  getTaskDisputeEvidences() {},
  assignTask() {},
  submitTranslation() {},
  approveTranslation() {},
  reimburseRequester() {},
  acceptTranslation() {},
  challengeTranslation() {},
  fundAppeal() {},
  submitEvidence() {},
};

export default async function createApiFacade({ web3, chainId }) {
  const archon = withProvider(web3.currentProvider);

  const apiInfoTree = await asyncMapValues(async addresses => {
    const [withEthPayments, withTokenPayments] = await Promise.all([
      getLinguoContracts({ web3, chainId, address: addresses.linguo, deployment: Linguo }),
      getLinguoContracts({ web3, chainId, address: addresses.linguoToken, deployment: LinguoToken }),
    ]);

    return createContractApis({ web3, archon, withEthPayments, withTokenPayments });
  }, getLanguageGrouPairsByChainId({ chainId }));

  const addressesByLanguageGroupPair = mapValues(
    ({ linguo, linguoToken }) => [linguo.address, linguoToken.address],
    apiInfoTree
  );

  const apiInstancesByAddress = reduce(
    (acc, { linguo, linguoToken }) =>
      Object.assign(acc, {
        [linguo.address]: linguo.api,
        [linguoToken.address]: linguoToken.api,
      }),
    {},
    Object.values(apiInfoTree)
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

        return new Proxy(target[prop], extractAddressFromIdHandler);
      }
    },
  };

  const createTaskHandler = {
    apply: (target, thisArg, args) => {
      const { token = ADDRESS_ZERO, sourceLanguage, targetLanguage } = args[0] ?? {};

      if (!sourceLanguage || !targetLanguage) {
        throw new Error('Cannot create a task without valid source and target languages');
      }

      const langGroupPair = LanguageGroupPair(getLanguageGroup(sourceLanguage), getLanguageGroup(targetLanguage));

      const info = apiInfoTree[langGroupPair];
      if (!info) {
        throw new Error(`Cannot create a task for pair (${sourceLanguage}, ${targetLanguage})`);
      }

      const { linguo, linguoToken } = info;

      const actualInstance = token === ADDRESS_ZERO ? linguo.api : linguoToken.api;
      return actualInstance[target.name].apply(actualInstance, args);
    },
  };

  const getTranslatorTasksHandler = {
    apply: async (target, thisArg, args) => {
      const { skills } = args[0] ?? {};

      if (!Array.isArray(skills)) {
        const data = await asyncMap(
          actualInstance => actualInstance[target.name].apply(actualInstance, args),
          Object.values(apiInstancesByAddress)
        );

        return flatten(data);
      }

      const instances = getContractInstancesForTranslator({
        skills,
        addressesByLanguageGroupPair,
        apiInstancesByAddress,
      });

      const actualArgs = [omit(['skills'], args[0]), ...args.slice(1)];

      const data = await asyncMap(
        actualInstance => actualInstance[target.name].apply(actualInstance, actualArgs),
        instances
      );

      return flatten(data);
    },
  };

  const getRequesterTasksHandler = {
    apply: async (target, thisArg, args) => {
      const account = args?.[0]?.account;

      const instances = await getContractInstancesForRequester({
        web3,
        chainId,
        account,
        apiInstancesByAddress,
      });

      const data = await asyncMap(actualInstance => actualInstance[target.name].apply(actualInstance, args), instances);

      return flatten(data);
    },
  };

  const extractAddressFromIdHandler = {
    apply: (target, thisArg, args) => {
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

      const actualInstance = apiInstancesByAddress[address];

      if (!actualInstance) {
        throw new Error(`Task with ID ${ID} does not exist`);
      }

      return actualInstance[target.name].apply(actualInstance, actualArgs);
    },
  };

  return new Proxy(apiSkeleton, propHandler);
}

async function getLinguoContracts({ web3, chainId, address, deployment }) {
  // set the max listeners warning threshold
  web3.eth.maxListenersWarningThreshold = 1000;

  address = deployment.networks[chainId]?.address;

  if (!address) {
    throw new Error(`Could not find address for linguo contract on network ${chainId}`);
  }

  const linguo = new web3.eth.Contract(deployment.abi, address);
  const arbitratorAddress = await linguo.methods.arbitrator().call();
  const arbitrator = new web3.eth.Contract(Arbitrator.abi, arbitratorAddress);

  return { linguo, arbitrator };
}

function getLanguageGrouPairsByChainId({ chainId }) {
  try {
    const addresses = JSON.parse(process.env.LINGUO_CONTRACT_ADDRESSES);
    return addresses[chainId];
  } catch (err) {
    throw new Error('Environment variable LINGUO_CONTRACT_ADDRESSES should be a valid JSON');
  }
}

function createContractApis({ web3, archon, withEthPayments, withTokenPayments }) {
  const linguoAddress = withEthPayments.linguo.options.address;
  const linguo = {
    address: linguoAddress,
    api: createEthContractApi({ web3, archon, ...withEthPayments }),
  };

  const linguoTokenAddress = withTokenPayments.linguo.options.address;
  const linguoToken = {
    address: linguoTokenAddress,
    api: createTokenContractApi({ web3, archon, ...withTokenPayments }),
  };

  return { linguo, linguoToken };
}

function getContractInstancesForTranslator({ skills, addressesByLanguageGroupPair, apiInstancesByAddress }) {
  const relevantSkills = getRelevantSkills(skills);
  const getUniqueLanguageGroups = compose(uniq, map(compose(getLanguageGroup, prop('language'))));
  const allPossiblePairs = combination(getUniqueLanguageGroups(relevantSkills), 2);

  const languageGroupPairs = compose(
    map(String),
    filter(isSupportedLanguageGroupPair),
    map(LanguageGroupPair.fromArray)
  )([...allPossiblePairs]);

  const getUniqueAddresses = compose(uniq, flatten, Object.values, pick(languageGroupPairs));

  const addresses = getUniqueAddresses(addressesByLanguageGroupPair);

  return Object.values(pick(addresses, apiInstancesByAddress));
}

/**
 * Considers 4 blocks per minute on average.
 */
const BLOCKS_IN_60_DAYS = 60 * 24 * 60 * 60 * 4;

async function getContractInstancesForRequester({ chainId, account, web3, apiInstancesByAddress }) {
  const subdomain = chainId === 42 ? 'api-kovan' : 'api';
  const endBlock = await web3.eth.getBlockNumber();
  const startBlock = subtract(endBlock, BLOCKS_IN_60_DAYS);

  const url = `//${subdomain}.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`;

  const response = await fetch(url);

  if (![200, 304].includes(response.status)) {
    console.warn(`Failed to fetch Linguo contracts account ${account} interacted with.`);
    return Object.values(apiInstancesByAddress);
  }

  const { result } = await response.json();

  /**
   * Etherscan API returns addresses converted all to lowercase.
   * To actually be able to compare them, we need to convert everything to lowercase
   * and then back when returning.
   */
  const addressesLowercaseKey = groupBy(addr => String(addr).toLowerCase(), Object.keys(apiInstancesByAddress));

  const addresses = compose(
    map(lowercaseAddr => addressesLowercaseKey[lowercaseAddr]),
    uniq,
    map(prop('to')),
    filter(compose(to => prop(to, addressesLowercaseKey), prop('to')))
  )(result);

  return Object.values(pick(addresses, apiInstancesByAddress));
}
