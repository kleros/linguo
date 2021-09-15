import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { omit } from '~/shared/fp';

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

export function useUnsetQueryParam() {
  const history = useHistory();
  const location = useLocation();
  const params = useQuery();

  return useCallback(
    (paramName, { replace = true } = {}) => {
      if (params[paramName] !== undefined) {
        const newParams = omit([paramName], params);
        const search = new URLSearchParams(newParams);
        const to = {
          ...location,
          search: String(search),
        };

        if (replace) {
          history.replace(to);
        } else {
          history.push(to);
        }
      }
    },
    [history, params, location]
  );
}
