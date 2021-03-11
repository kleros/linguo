import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { replace } from 'connected-react-router';
import { useQuery } from '~/adapters/react-router-dom';
import { setFilter, selectStatusFilter } from './requesterSlice';

export default function useFilters() {
  const dispatch = useDispatch();
  const queryParams = useQuery();
  const statusFilterFromStore = useSelector(selectStatusFilter);
  const statusFilterFromUrl = queryParams.status;

  useEffect(() => {
    if (!statusFilterFromUrl) {
      const search = new URLSearchParams({ status: statusFilterFromStore });

      dispatch(replace({ search: search.toString() }));
    } else if (statusFilterFromUrl !== statusFilterFromStore) {
      dispatch(setFilter({ status: statusFilterFromUrl }));
    }
  }, [dispatch, statusFilterFromUrl, statusFilterFromStore]);

  const _setFilter = useCallback(
    ({ status }, additionalArgs = {}) => {
      dispatch(setFilter({ status, ...additionalArgs }));
    },
    [dispatch]
  );

  const status = statusFilterFromUrl ?? statusFilterFromStore;

  const filters = useMemo(() => ({ status }), [status]);

  return [filters, _setFilter];
}
