import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { replace } from 'connected-react-router';
import { useQuery } from '~/adapters/react-router-dom';
import { selectAllTasksFilter, selectStatusFilter, setFilters } from './translatorSlice';

export default function useFilter() {
  const dispatch = useDispatch();
  const queryParams = useQuery();

  const statusFilterFromStore = useSelector(selectStatusFilter);
  const allTasksFilterFromStore = useSelector(selectAllTasksFilter);

  const statusFilterFromUrl = queryParams.status;
  const allTasksFilterFromUrl = queryParams.allTasks === 'true';

  useEffect(() => {
    if (!statusFilterFromUrl && allTasksFilterFromStore !== undefined) {
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

  const status = statusFilterFromUrl ?? statusFilterFromStore;
  const allTasks = allTasksFilterFromUrl ?? allTasksFilterFromStore;

  const filters = useMemo(
    () => ({
      status,
      allTasks,
    }),
    [status, allTasks]
  );

  return [filters, _setFilters];
}
