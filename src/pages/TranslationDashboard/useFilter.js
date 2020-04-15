import { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery } from '~/adapters/reactRouterDom';
import { filters } from '~/api/linguo';

const getActiveFilter = value => {
  if (value === undefined) {
    return filters.open;
  }
  return Object.keys(filters).includes(value) ? value : undefined;
};

export default function useFilter() {
  const history = useHistory();
  const queryParams = useQuery();
  const filter = getActiveFilter(queryParams.filter);

  const setFilter = useCallback(
    (filterName, additionalParams) => {
      const newFilter = getActiveFilter(filterName);
      const params = new URLSearchParams({ filter: newFilter, ...additionalParams });

      const method = newFilter === filter ? 'replace' : 'push';
      history[method](`?${params}`);
    },
    [history, filter]
  );

  useEffect(() => {
    if (filter === undefined) {
      history.replace(`?filter=${getActiveFilter()}`);
    }
  }, [history, filter]);

  return [filter, setFilter];
}
