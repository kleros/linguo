import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { replace } from 'connected-react-router';
import { useQuery } from '~/adapters/react-router-dom';
import { setFilters, selectFilter, selectSecondLevelFilter } from './translatorSlice';

export default function useFilter() {
  const dispatch = useDispatch();
  const queryParams = useQuery();

  const filterFromStore = useSelector(selectFilter);
  const secondLevelFilterFromStore = useSelector(selectSecondLevelFilter);

  const filterFromUrl = queryParams.filter;
  const secondLevelFilterFromUrl = queryParams.secondLevelFilter;

  useEffect(() => {
    if (!filterFromUrl) {
      const secondLevelFilterMixin = secondLevelFilterFromStore
        ? { secondLevelFilter: secondLevelFilterFromStore }
        : {};

      const search = new URLSearchParams({
        filter: filterFromStore,
        ...secondLevelFilterMixin,
      });

      dispatch(replace({ search: search.toString() }));
    } else if (filterFromUrl !== filterFromStore || secondLevelFilterFromUrl !== secondLevelFilterFromStore) {
      const secondLevelFilterMixin = secondLevelFilterFromUrl ? { secondLevelFilter: secondLevelFilterFromUrl } : {};

      dispatch(setFilters({ filter: filterFromUrl, ...secondLevelFilterMixin }));
    }
  }, [dispatch, filterFromStore, filterFromUrl, secondLevelFilterFromStore, secondLevelFilterFromUrl]);

  const _setFilters = useCallback(
    ({ filter, secondLevelFilter }, additionalArgs = {}) => {
      dispatch(setFilters({ filter, secondLevelFilter, ...additionalArgs }));
    },
    [dispatch]
  );

  return [
    {
      filter: filterFromUrl ?? filterFromStore,
      secondLevelFilter: secondLevelFilterFromUrl ?? secondLevelFilterFromStore,
    },
    _setFilters,
  ];
}
