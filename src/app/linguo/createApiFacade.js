import createContractApi from './createContractApi';

export default function createApiFacade({ web3, withEtherPayments }) {
  const linguoEtherAddress = withEtherPayments.linguo?.options.address;

  const interfaces = {
    [linguoEtherAddress]: createContractApi({ web3, ...withEtherPayments }),
  };

  const fullApi = {
    getRequesterTasks() {},
    getTranslatorTasks() {},
    getTaskById() {},
    getTaskPrice() {},
    getTranslatorDeposit() {},
    getChallengerDeposit() {},
    getTaskDispute() {},
    createTask() {},
    assignTask() {},
    submitTranslation() {},
    approveTranslation() {},
    reimburseRequester() {},
    acceptTranslation() {},
    challengeTranslation() {},
    fundAppeal() {},
  };

  const propHandler = {
    get: (target, prop) => {
      if (target[prop]) {
        if (['getRequesterTasks', 'getTranslatorTasks'].includes(prop)) {
          return new Proxy(target[prop], callBothOnMissingIdentifier);
        }

        return new Proxy(target[prop], callDefaultOnMissingIdentifier);
      }
    },
  };

  const callDefaultOnMissingIdentifier = {
    apply: (target, thisArg, args) => {
      const { name } = target;
      const ID = args?.[0]?.ID;

      if (!ID) {
        const contract = args?.[0]?.contract ?? linguoEtherAddress;

        const [first, ...rest] = args;
        const actualArgs = [
          {
            ...first,
            contract,
          },
          ...rest,
        ];

        const actualInterface = interfaces[contract];
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
      return actualInterface[name].apply(actualInterface, actualArgs);
    },
  };

  const callBothOnMissingIdentifier = {
    apply: async (target, thisArg, args) => {
      const { name } = target;
      const contract = args?.[0]?.contract;

      if (contract) {
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
