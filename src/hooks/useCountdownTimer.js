import { useState, useEffect } from 'react';
import useInterval from './useInterval';

export default function useCountdownTimer({ seconds = 0, refreshInterval = 1000 } = {}) {
  const [remainingTime, setRemainingTime] = useState(seconds);

  useEffect(() => {
    setRemainingTime(seconds);
  }, [seconds]);

  const updateState = () => {
    if (remainingTime <= 0) {
      setRemainingTime(0);
    } else {
      setRemainingTime(remainingTime => Math.floor(remainingTime - refreshInterval / 1000));
    }
  };

  const shouldStop = remainingTime <= 0;
  refreshInterval = typeof refreshInterval === 'function' ? refreshInterval(remainingTime) : Number(refreshInterval);
  const delay = shouldStop ? null : refreshInterval;

  useInterval(updateState, delay);

  return remainingTime;
}
