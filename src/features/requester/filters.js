import { Task, TaskStatus } from '~/features/tasks';

export const filters = {
  all: 'all',
  open: 'open',
  inProgress: 'inProgress',
  inReview: 'inReview',
  inDispute: 'inDispute',
  finished: 'finished',
  incomplete: 'incomplete',
};

/**
 * Get a filter predicate function based on a predefined filterName.
 *
 * @param {string} filterName The filterName of the filter
 * @return {'all'|'open'|'inProgress'|'inReview'|'inDispute'|'finished'|'incomplete'} the name of the filter or 'all' if it does not exist.
 */
export function getFilter(filterName) {
  return filters[filterName] ?? filters.all;
}

const filterPredicates = {
  all: () => true,
  open: task => !Task.isIncomplete(task) && task.status === TaskStatus.Created,
  inProgress: task => !Task.isIncomplete(task) && task.status === TaskStatus.Assigned,
  inReview: ({ status }) => status === TaskStatus.AwaitingReview,
  inDispute: ({ status }) => status === TaskStatus.DisputeCreated,
  finished: task => !Task.isIncomplete(task) && task.status === TaskStatus.Resolved,
  incomplete: task => Task.isIncomplete(task),
};

/**
 * Get a filter predicate function based on a predefined filterName.
 *
 * @param {string} filterName The filterName of the filter
 * @return TaskFilterPredicate a filter predicated function to be used with Array#filter.
 */
export function getFilterPredicate(filterName) {
  return filterPredicates[filterName] ?? filterPredicates.all;
}

/**
 * This callback is displayed as a global member.
 * @callback TaskFilterPredicate
 * @param {object} task The task object.
 * @return {boolean} If the task should be included in the filter or not.
 */
