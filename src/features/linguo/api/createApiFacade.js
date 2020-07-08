import { Arbitrator, Linguo, LinguoToken } from '@kleros/contract-deployments/linguo';
import { withProvider } from '~/app/archon';
import { ADDRESS_ZERO } from './constants';
import { createEthContractApi, createTokenContractApi } from './createContractApi';

export default async function createApiFacade({ web3, chainId }) {
  const archon = withProvider(web3.currentProvider);

  const [withEtherPayments, withTokenPayments] = await Promise.all([
    getLinguoContracts({ web3, chainId, deployment: Linguo }),
    getLinguoContracts({ web3, chainId, deployment: LinguoToken }),
  ]);

  const linguoEtherAddress = withEtherPayments.linguo?.options.address;
  const linguoTokenAddress = withTokenPayments.linguo?.options.address;

  const interfaces = {
    [linguoEtherAddress]: createEthContractApi({ web3, archon, ...withEtherPayments }),
    [linguoTokenAddress]: createTokenContractApi({ web3, archon, ...withTokenPayments }),
  };

  const fullApi = {
    getRequesterTasks() {},
    getTranslatorTasks() {},
    getTaskById() {},
    getTaskPrice() {},
    getTranslatorDeposit() {},
    getChallengerDeposit() {},
    getTaskDispute() {},
    getTaskDisputeEvidences() {},
    createTask() {},
    assignTask() {},
    submitTranslation() {},
    approveTranslation() {},
    reimburseRequester() {},
    acceptTranslation() {},
    challengeTranslation() {},
    fundAppeal() {},
    submitEvidence() {},
  };

  const propHandler = {
    get: (target, prop) => {
      if (target[prop]) {
        if (['getRequesterTasks', 'getTranslatorTasks'].includes(prop)) {
          return new Proxy(target[prop], callBothIfMissingIDOrToken);
        }

        return new Proxy(target[prop], callDefaultIfMissingIDOrToken);
      }
    },
  };

  const callDefaultIfMissingIDOrToken = {
    apply: (target, thisArg, args) => {
      const { name } = target;
      const ID = args?.[0]?.ID;

      if (!ID) {
        const token = args?.[0]?.token ?? ADDRESS_ZERO;
        const contract = token === ADDRESS_ZERO ? linguoEtherAddress : linguoTokenAddress;

        const [first, ...rest] = args;
        const actualArgs = [
          {
            ...first,
            token,
            contract,
          },
          ...rest,
        ];

        const actualInterface = interfaces[contract];

        if (!actualInterface) {
          throw new Error(`Task with ID ${ID} does not exist`);
        }

        return actualInterface[name].apply(actualInterface, actualArgs);
      }

      const [contract, internalID] = String(ID).includes('/') ? String(ID).split('/') : [linguoEtherAddress, ID];

      const [first, ...rest] = args;
      const actualArgs = [
        {
          ...first,
          ID: internalID,
        },
        ...rest,
      ];

      const actualInterface = interfaces[contract];

      if (!actualInterface) {
        throw new Error(`Task with ID ${ID} does not exist`);
      }

      return actualInterface[name].apply(actualInterface, actualArgs);
    },
  };

  const callBothIfMissingIDOrToken = {
    apply: async (target, thisArg, args) => {
      const { name } = target;
      const token = args?.[0]?.token;

      if (token) {
        const contract = token === 'ETH' ? linguoEtherAddress : linguoTokenAddress;

        const actualInterface = interfaces[contract];
        return actualInterface[name].apply(actualInterface, args);
      }

      const data = await Promise.all(
        Object.values(interfaces).map(actualInterface => actualInterface[name].apply(actualInterface, args))
      );

      return data.flat();
    },
  };

  return new Proxy(fullApi, propHandler);
}

async function getLinguoContracts({ web3, chainId, deployment }) {
  const address = deployment.networks[chainId]?.address;

  if (!address) {
    throw new Error(`Could not find address for linguo contract on network ${chainId}`);
  }

  const linguo = new web3.eth.Contract(deployment.abi, address);
  const arbitratorAddress = await linguo.methods.arbitrator().call();
  const arbitrator = new web3.eth.Contract(Arbitrator.abi, arbitratorAddress);

  return { linguo, arbitrator };
}
