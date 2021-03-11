import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { replace } from 'connected-react-router';
import { useQuery } from '~/adapters/react-router-dom';
import { setFilters, selectStatusFilter, selectAllTasksFilter } from './translatorSlice';

export default function useFilter() {
  const dispatch = useDispatch();
  const queryParams = useQuery();

  const statusFilterFromStore = useSelector(selectStatusFilter);
  const allTasksFilterFromStore = useSelector(selectAllTasksFilter);

  const statusFilterFromUrl = queryParams.status;
  const allTasksFilterFromUrl = queryParams.secondLevelFilter;

  useEffect(() => {
    if (!statusFilterFromUrl) {
      const allTasksFilterMixin = allTasksFilterFromStore ? { allTasks: allTasksFilterFromStore } : {};

      const search = new URLSearchParams({
        status: statusFilterFromStore,
        ...allTasksFilterMixin,
      });

      dispatch(replace({ search: search.toString() }));
    } else if (statusFilterFromUrl !== statusFilterFromStore || allTasksFilterFromUrl !== allTasksFilterFromStore) {
      const allTasksFilterMixin = allTasksFilterFromUrl ? { allTasks: allTasksFilterFromUrl } : {};

      dispatch(setFilters({ status: statusFilterFromUrl, ...allTasksFilterMixin }));
    }
  }, [dispatch, statusFilterFromStore, statusFilterFromUrl, allTasksFilterFromStore, allTasksFilterFromUrl]);

  const _setFilters = useCallback(
    ({ status, allTasks }, additionalArgs = {}) => {
      dispatch(setFilters({ status, allTasks, ...additionalArgs }));
    },
    [dispatch]
  );

  return [
    {
      status: statusFilterFromUrl ?? statusFilterFromStore,
      allTasks: allTasksFilterFromUrl ?? allTasksFilterFromStore,
    },
    _setFilters,
  ];
}
