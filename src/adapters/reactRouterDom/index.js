import { useCallback, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

export function useQuery() {
  return Object.fromEntries(new URLSearchParams(useLocation().search).entries());
}

export function useImperativeRefresh() {
  const history = useHistory();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  searchParams.set('_refresh', true);
  const search = searchParams.toString();

  return useCallback(() => history.replace({ ...location, search }), [history, location, search]);
}

export function useRefreshEffectOnce(fn) {
  const { _refresh } = useQuery();
  const history = useHistory();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  searchParams.delete('_refresh');
  const search = searchParams.toString();

  useEffect(() => {
    if (_refresh) {
      fn();
      history.replace({ ...location, search });
    }
  }, [_refresh, fn, history, location, search]);
}
