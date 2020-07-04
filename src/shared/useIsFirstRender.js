import { useEffect, useRef } from 'react';

/**
 * Returns whether it is the first time the component is rendering or not.
 *
 * @return {boolean}
 */
export default function useIsFirstRender() {
  const firstRenderRef = useRef(true);

  useEffect(() => {
    firstRenderRef.current = false;
  }, []);

  return firstRenderRef.current;
}
