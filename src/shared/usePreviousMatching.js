import { useRef, useEffect } from 'react';

export default function usePreviousMatching(value, match) {
  const previous = useRef();

  useEffect(() => {
    if (match(value)) {
      previous.current = value;
    }
  }, [match, value]);

  return match(value) ? value : previous.current;
}
