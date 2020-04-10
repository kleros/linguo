import { useState } from 'react';
import useInterval from './useInterval';

export default function useCountdownTimer({ seconds = 0, updateIntervalMs = 1000 } = {}) {
  const [remainingTime, setRemainingTime] = useState(seconds);

  updateIntervalMs =
    typeof updateIntervalMs === 'function' ? updateIntervalMs(remainingTime) : Number(updateIntervalMs);

  const { stop } = useInterval(
    () => {
      if (remainingTime <= 0) {
        stop();
        setRemainingTime(0);
      } else {
        setRemainingTime(remainingTime => Math.floor(remainingTime - updateIntervalMs / 1000));
      }
    },
    updateIntervalMs,
    {
      autoStart: true,
      runImmediately: false,
    }
  );

  return remainingTime;
}
