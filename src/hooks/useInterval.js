import { useState, useEffect, useRef, useCallback } from 'react';

const noop = () => {};

export default function useInterval(fn, intervalDuration, { autoStart = true, runImmediately = false } = {}) {
  const fnRef = useRef(noop);
  const [isRunning, setIsRunning] = useState(false);
  const [isExternallyStopped, setIsExternallyStopped] = useState(false);
  const [handler, setHandler] = useState();

  // Remember the latest fn.
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const start = useCallback(() => {
    if (!isRunning && intervalDuration !== undefined) {
      const tick = () => fnRef.current();
      const id = setInterval(tick, intervalDuration);

      setIsRunning(true);
      setHandler(id);

      if (!runImmediately) return;

      fnRef.current();
    }
  }, [intervalDuration, isRunning, runImmediately]);

  const internalStop = useCallback(() => {
    if (!isRunning) return;

    clearInterval(handler);
    setHandler(undefined);
    setIsRunning(false);
  }, [handler, isRunning]);

  const stop = useCallback(() => {
    setIsExternallyStopped(true);
    internalStop();
  }, [internalStop]);

  // Set up the interval.
  useEffect(() => {
    if (autoStart && !isExternallyStopped) {
      start();
    }

    return () => internalStop();
  }, [autoStart, isExternallyStopped, isRunning, start, internalStop]);

  return { start, stop, handler };
}
