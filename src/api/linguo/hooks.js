import { useState, useEffect } from 'react';
import { Linguo } from '@kleros/contract-deployments';
import useInterval from '~/hooks/useInterval';
import { calculateRemainingSubmitTimeInSeconds } from './entities/Task';
import createApi from './createApi';

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
          api: createApi({
            BigNumber: web3.utils.BN,
            toWei: web3.utils.toWei,
            contract,
          }),
        });
      } else {
        setState({
          isReady: false,
          error: new Error(`Linguo contract has no address for network ${chainId}`),
          contract: undefined,
          api: undefined,
        });
      }
    }
  }, [web3, chainId]);

  return state;
}

export function useTimeoutCountdown(
  { status, lastInteraction, submissionTimeout } = {},
  { updateIntervalMs = 1000 } = {}
) {
  const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState(0);

  const actualUpdateIntervalMs =
    typeof updateIntervalMs === 'function' ? updateIntervalMs(remainingTimeInSeconds) : Number(updateIntervalMs);

  const { stop } = useInterval(
    () => {
      const remainingTime = calculateRemainingSubmitTimeInSeconds({
        status,
        lastInteraction,
        submissionTimeout,
      });

      setRemainingTimeInSeconds(remainingTime);
      if (remainingTime === 0) {
        stop();
      }
    },
    actualUpdateIntervalMs,
    {
      autoStart: true,
      runImmediately: true,
    }
  );

  return remainingTimeInSeconds;
}
