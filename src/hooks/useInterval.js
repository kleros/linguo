import { useEffect, useRef } from 'react';

export default function useInterval(fn, delay) {
  const savedFn = useRef();

  useEffect(() => {
    savedFn.current = fn;
  }, [fn]);

  useEffect(() => {
    const tick = () => savedFn.current();

    if (delay !== null) {
      const handler = setInterval(tick, delay);
      return () => clearInterval(handler);
    }
  }, [delay]);
}
