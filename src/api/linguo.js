import { useState, useEffect } from 'react';
import { Linguo } from '@kleros/contract-deployments';

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
          api: createApi({ contract }),
        });
      } else {
        setState({
          isReady: false,
          error: new Error(`Linguo contract has not addres for network ${chainId}`),
          contract: undefined,
          api: undefined,
        });
      }
    }
  }, [web3, chainId]);

  return state;
}

function createApi({ contract }) {
  return {
    async createTask({ account, minPrice, maxPrice, deadline, metaEvidence }) {
      try {
        const receipt = await contract.methods.createTask(deadline, minPrice, metaEvidence).send({
          from: account,
          value: maxPrice,
        });

        return receipt;
      } catch (err) {
        const newError = new Error('Failed to create the translation task');
        newError.cause = err;
        throw newError;
      }
    },

    async *watchTaskCreated({ account }) {
      const results = [];
      let deferedResolve;
      let promise = new Promise(resolve => {
        deferedResolve = resolve;
      });
      let done = false;

      contract.events
        .TaskCreated({
          filter: {
            _requester: account,
          },
          fromBlock: 17656362,
        })
        .on('data', event => {
          console.log('Got TaskCreated event:', event);
          deferedResolve();
          results.push(event.returnValues);
          promise = new Promise(resolve => {
            deferedResolve = resolve;
          });
        })
        .on('error', err => {
          throw err;
        });

      while (!done) {
        await promise;
        const { cancel = false } = (yield* results) || {};
        done = !cancel;
      }
    },
  };
}
