/* eslint-disable react-hooks/rules-of-hooks */
import { Contract } from '@ethersproject/contracts';
import useSWRImmutable from 'swr/immutable';
import useSWR from 'swr';

import Linguo from '@kleros/linguo-contracts/artifacts/contracts/0.7.x/Linguo.sol/Linguo.json';
import IArbitrator from '@kleros/erc-792/build/contracts/IArbitrator.json';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';

const fetcher = (library, abi) => args => {
  if (!library) return;
  const [arg1, arg2, ...params] = args;
  const address = arg1;
  const method = arg2;
  const contract = new Contract(address, abi, library);
  return contract[method](...params);
};

export const getReviewTimeout = async (address, library) => {
  const contract = new Contract(address, Linguo.abi, library);
  return await contract.reviewTimeout();
};

/* const logger = useSWRNext => {
    return (key, fetcher, config) => {
        // Add logger to the original fetcher.
        const extendedFetcher = (...args) => {
            console.log('SWR Request:', key);
            return fetcher(...args);
        };

        // Execute the hook with the new fetcher.
        return useSWRNext(key, extendedFetcher, config);
    };
}; */

export const useLinguo = () => {
  const { account, chainId, library } = useWeb3();
  const { address } = useParamsCustom(chainId);

  const call = (method, ...params) => {
    const { data } = useSWR([address, method, ...params], {
      fetcher: fetcher(library, Linguo.abi),
    });

    return typeof data === 'undefined' ? 0 : data instanceof BigNumber ? data : String(data);
  };

  const _send = async (method, ...params) => {
    try {
      const contract = new Contract(address, Linguo.abi, library);
      const tx = await contract.connect(account).methods[method](...params);
      // invalidate the cache so that the data is refetched
      // mutate([address, method, ...params])
      return tx;
    } catch (error) {
      console.error(error);
    }
  };

  return {
    call: (method, ...params) => {
      const { data } = useSWR([address, method, ...params], {
        fetcher: fetcher(library, Linguo.abi),
      });

      return typeof data === 'undefined' ? 0 : data instanceof BigNumber ? data : String(data);
    },
    send: async (method, ...params) => {
      try {
        const contract = new Contract(address, Linguo.abi, library);
        const tx = await contract.connect(account).methods[method](...params);
        // invalidate the cache so that the data is refetched
        // mutate([address, method, ...params])
        return tx;
      } catch (error) {
        console.error(error);
      }
    },
    getArbitrationCost: () => {
      const { data: arbitratorExtraData } = useSWRImmutable([address, 'arbitratorExtraData'], {
        fetcher: fetcher(library, Linguo.abi),
      });

      const { data: arbitrator } = useSWR([address, 'arbitrator'], {
        fetcher: fetcher(library, Linguo.abi),
      });

      const { data: arbitrationCost } = useSWR([arbitrator, 'arbitrationCost', arbitratorExtraData], {
        fetcher: fetcher(library, IArbitrator.abi),
      });
      return arbitrationCost;
    },
    getDisputeStatus: disputeID => {
      const { data: arbitrator } = useSWR([address, 'arbitrator'], {
        fetcher: fetcher(library, Linguo.abi),
      });
      const { data: status } = useSWR(
        typeof arbitrator !== 'undefined' ? [arbitrator, 'disputeStatus', disputeID] : false,
        {
          fetcher: fetcher(library, IArbitrator.abi),
        }
      );
      return status;
    },
    getAppealCost: disputeID => {
      const { data: arbitratorExtraData } = useSWRImmutable([address, 'arbitratorExtraData'], {
        fetcher: fetcher(library, Linguo.abi),
      });
      // TODO: check if it is reasonable to implement SWR middleware
      const { data: arbitrator } = useSWR([address, 'arbitrator'], {
        fetcher: fetcher(library, Linguo.abi),
      });

      const { data: appealCost } = useSWR([arbitrator, 'appealCost', disputeID, arbitratorExtraData], {
        fetcher: fetcher(library, IArbitrator.abi),
      });
      return appealCost;
    },
    getChallengeDeposit: taskID => {
      return call('getChallengeValue', taskID);
    },
    getTranslatorDeposit: taskID => {
      return call('getDepositValue', taskID);
    },
    getRewardPoolParams: () => {
      const winnerStakeMultiplier = call('winnerStakeMultiplier');
      const loserStakeMultiplier = call('loserStakeMultiplier');
      const sharedStakeMultiplier = call('sharedStakeMultiplier');
      const multiplierDivisor = call('MULTIPLIER_DIVISOR');

      return { winnerStakeMultiplier, loserStakeMultiplier, sharedStakeMultiplier, multiplierDivisor };
    },
    createTask: async args => {
      return await _send('createTask', args);
    },
  };
};

/* const getArbitrationCost = () => {
    // Create the SWR middleware function
    const swrMiddleware = (useSWRNext) => {
      return (key, fetcher, config) => {
        // Use a ref to store the data from each hook
        const dataRef = useRef({});
  
        // Actual SWR hook
        const swr = useSWRNext(key, fetcher, config);
  
        useEffect(() => {
          // Update the dataRef with the current hook's data
          if (swr.data !== undefined) {
            dataRef.current[key] = swr.data;
          }
        }, [swr.data]);
  
        // Fetch the next hook when the data for the previous hook is available
        useEffect(() => {
          if (dataRef.current[key]) {
            // Set the next hook's key and dependencies based on the current hook's data
            const nextKey = [dataRef.current[key], 'arbitrator', dataRef.current[[address, 'arbitratorExtraData']]];
            const nextDependencies = [dataRef.current[key], dataRef.current[[address, 'arbitratorExtraData']]];
            swr.mutate(nextKey, fetcher, config, nextDependencies);
          }
        }, [dataRef.current[key]]);
  
        return swr;
      }
    }
  
    // Use the custom SWR hook with the middleware
    const { data: arbitrationCost } = useSWR([address, 'arbitratorExtraData'], {
      fetcher: fetcher(library, Linguo.abi),
      middleware: swrMiddleware,
    });
  
    return arbitrationCost;
  }
 */

/*
const useSWRWithMiddleware = (key, fetcher, middleware) => {
  return useSWR(key, {
      fetcher,
      middleware,
  });
};

const getArbitrationCost = () => {
  const { data: arbitratorExtraData } = useSWR([address, 'arbitratorExtraData'], {
      fetcher: fetcher(library, Linguo.abi),
  });

  const { data: arbitrator } = useSWR([address, 'arbitrator'], {
      fetcher: fetcher(library, Linguo.abi),
  });

  // Use the helper function to wrap the useSWR hook in the middleware.
  const { data: arbitrationCost } = useSWRWithMiddleware(
      [arbitrator, 'arbitrationCost'],
      fetcher(library, IArbitrator.abi),
      [arbitratorExtraData, arbitrator]
  );

  return arbitrationCost;
}; */

export const useLinguoApi = () => {
  const { account, chainId, library } = useWeb3();
  const { address: contractAddress } = useParamsCustom(chainId);
  const [address, setAddress] = useState();

  // const contractAdressesByLang = JSON.parse(process.env.LINGUO_CONTRACT_ADDRESSES);

  useEffect(() => {
    if (!contractAddress) return;
    setAddress(contractAddress);
  }, [contractAddress]);

  const _call = async (address, deployment, method, ...args) => {
    try {
      const contract = new Contract(address, deployment, library);

      const numberOfArgs = contract.interface.getFunction(method).inputs.length;
      if (args.length !== numberOfArgs && args.length !== numberOfArgs + 1) {
        throw new Error(`Invalid number of arguments for function: ${method} `);
      }

      return await contract[method](...args);
    } catch (error) {
      console.error(error);
    }
  };

  const _send = async (method, { args, value }) => {
    const contract = new Contract(address, Linguo.abi, library.getSigner());

    const numberOfArgs = contract.interface.getFunction(method).inputs.length;
    if (args.length !== numberOfArgs && args.length !== numberOfArgs + 1) {
      throw new Error(`Invalid number of arguments for function: ${method} `);
    }

    const tx = await contract[method](...args, { value: value });
    return tx;
  };

  const increase = value => ({
    by: percentage => {
      const increase = value.mul(percentage).div(100);
      return value.add(increase);
    },
  });

  return {
    address,
    setAddress,
    createTask: async (deadline, minPrice, metaEvidence, maxPrice) => {
      return await _send(LinguoInteraction.createTask, {
        args: [deadline, minPrice, metaEvidence],
        value: maxPrice,
      });
    },
    assignTask: async taskID => {
      const translationDeposit = await _call(address, Linguo.abi, 'getDepositValue', taskID);
      const safeTranslationDeposit = increase(translationDeposit).by(1);
      return await _send(LinguoInteraction.assignTask, { args: [taskID], value: safeTranslationDeposit });
    },

    acceptTranlation: async taskID => {
      return await _send(LinguoInteraction.acceptTranlation, { args: [taskID] });
    },
    challengeTranslation: async (taskID, evidence) => {
      return await _send(LinguoInteraction.challengeTranslation, { args: [taskID, evidence] });
    },
    submitTranslation: async (taskID, translation) => {
      return await _send(LinguoInteraction.submitTranslation, { args: [taskID, translation] });
    },
    fundAppeal: async (taskID, party, totalAppealCost) => {
      return await _send('fundAppeal', { args: [taskID, party], value: totalAppealCost });
    },
    reimburseRequester: async taskID => {
      return await _send('reimburseRequester', { args: [taskID] });
    },
    withdrawFeesAndRewards: async taskID => {
      return await _send('batchRoundWithdraw', { args: [account, taskID, 0, 0] });
    },
  };
};

const LinguoInteraction = {
  createTask: 'createTask',
  assignTask: 'assignTask',
  acceptTranslation: 'acceptTranlation',
  submitTranslation: 'submitTranslation',
  challengeTranslation: 'challengeTranslation',
};
