import { useCallback, useEffect, useRef } from 'react';

export default function useCallbackIfMounted(fn) {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(
    (...args) => {
      if (mountedRef.current) {
        return fn(...args);
      }
    },
    [fn]
  );
}
