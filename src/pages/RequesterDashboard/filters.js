import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery } from '~/adapters/reactRouterDom';
import { Task, TaskStatus } from '~/app/linguo';

const filterMap = {
  all: () => true,
  open: task => !Task.isIncomplete(task) && task.status === TaskStatus.Created,
  inProgress: task => !Task.isIncomplete(task) && task.status === TaskStatus.Assigned,
  inReview: ({ status }) => status === TaskStatus.AwaitingReview,
  inDispute: ({ status }) => status === TaskStatus.DisputeCreated,
  finished: task => !Task.isIncomplete(task) && task.status === TaskStatus.Resolved,
  incomplete: task => Task.isIncomplete(task),
};

const filters = Object.freeze(
  Object.keys(filterMap).reduce(
    (acc, key) =>
      Object.assign(acc, {
        [key]: key,
      }),
    {}
  )
);

export default filters;

/**
 * Get a filter predicate function based on a predefined filterName.
 *
 * @param {'all'|'open'|'inProgress'|'inReview'|'inDispute'|'finished'|'incomplete'} filterName The filterName of the filter
 * @return TaskFilterPredicate a filter predicated function to be used with Array#filter.
 */
export function getFilter(filterName) {
  return filterMap[filterName] ?? filterMap.all;
}

export function useFilterName({ initial = filters.open } = {}) {
  const history = useHistory();
  const queryParams = useQuery();
  const filter = queryParams.filter ?? initial;

  const setFilter = useCallback(
    (newFilterName, additionalParams) => {
      if (!filters[newFilterName]) {
        return;
      }

      const newFilter = filters[newFilterName];
      const params = new URLSearchParams({ filter: newFilter, ...additionalParams });

      const method = newFilter === filter ? 'replace' : 'push';
      history[method](`?${params}`);
    },
    [history, filter]
  );

  return [filter, setFilter];
}

/**
 * This callback is displayed as a global member.
 * @callback TaskFilterPredicate
 * @param {object} task The task object.
 * @return {boolean} If the task should be included in the filter or not.
 */
