import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useQuery() {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search).entries();

    return [...params].reduce(
      (acc, [key, value]) =>
        Object.assign(acc, {
          [key]: value,
        }),
      {}
    );
  }, [search]);
}
