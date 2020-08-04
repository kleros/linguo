import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { replace } from 'connected-react-router';
import { useQuery } from '~/adapters/react-router-dom';
import { setFilter, selectFilter } from './requesterSlice';

export default function useFilter() {
  const dispatch = useDispatch();
  const queryParams = useQuery();
  const filterFromStore = useSelector(selectFilter);
  const filterFromUrl = queryParams.filter;

  useEffect(() => {
    if (!filterFromUrl) {
      const search = new URLSearchParams({ filter: filterFromStore });

      dispatch(replace({ search: search.toString() }));
    } else if (filterFromUrl !== filterFromStore) {
      dispatch(setFilter({ filter: filterFromUrl }));
    }
  }, [dispatch, filterFromUrl, filterFromStore]);

  const _setFilter = useCallback(
    (filter, additionalArgs = {}) => {
      dispatch(setFilter({ filter, ...additionalArgs }));
    },
    [dispatch]
  );

  return [filterFromUrl ?? filterFromStore, _setFilter];
}
