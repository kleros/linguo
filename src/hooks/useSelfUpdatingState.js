import { useState } from 'react';
import useInterval from './useInterval';

const neverStop = () => false;

export default function useSelfUpdatingState({ getState, stopWhen = neverStop, updateIntervalMs = 1000 }) {
  const [state, setState] = useState(getState());

  updateIntervalMs = typeof updateIntervalMs === 'function' ? updateIntervalMs(state) : Number(updateIntervalMs);

  const { stop } = useInterval(
    () => {
      const newState = getState();
      setState(newState);

      if (stopWhen(newState)) {
        stop();
      }
    },
    updateIntervalMs,
    {
      autoStart: true,
      runImmediately: false,
    }
  );

  return state;
}
