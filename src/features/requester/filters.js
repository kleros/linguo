import { Task, TaskStatus } from '~/features/tasks';

export const statusFilters = {
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
export function getStatusFilter(filterName) {
  return statusFilters[filterName] ?? statusFilters.all;
}

const statusFilterPredicates = {
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
export function getStatusFilterPredicate(filterName) {
  return statusFilterPredicates[filterName] ?? statusFilterPredicates.all;
}

/**
 * This callback is displayed as a global member.
 * @callback TaskStatusFilterPredicate
 * @param {object} task The task object.
 * @return {boolean} If the task should be included in the filter or not.
 */
