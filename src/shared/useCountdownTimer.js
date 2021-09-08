import { useCallback, useEffect, useState } from 'react';
import useInterval from './useInterval';

export default function useCountdownTimer({ seconds = 0, refreshInterval = 1000 } = {}) {
  const [remainingTime, setRemainingTime] = useState(seconds);

  useEffect(() => {
    setRemainingTime(seconds);
  }, [seconds]);

  refreshInterval = Number(typeof refreshInterval === 'function' ? refreshInterval(remainingTime) : refreshInterval);

  const shouldStop = remainingTime <= 0;
  const delay = shouldStop ? null : refreshInterval;

  const updateState = useCallback(() => {
    setRemainingTime(remainingTime => {
      if (remainingTime <= 0) {
        return 0;
      }

      return Math.max(0, Math.floor(remainingTime - refreshInterval / 1000));
    });
  }, [refreshInterval]);

  useInterval(updateState, delay);

  return remainingTime;
}
