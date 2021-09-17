import { Task, TaskParty, TaskStatus } from '~/features/tasks';
import { createSkillsTaskMatcher } from './skillsMatchTask';

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

const createStatusFilterPredicates = {
  all: () => () => true,
  open: () => task => !Task.isIncomplete(task) && task.status === TaskStatus.Created,
  inProgress: () => task => !Task.isIncomplete(task) && task.status === TaskStatus.Assigned,
  inReview:
    () =>
    ({ status }) =>
      status === TaskStatus.AwaitingReview,
  inDispute:
    () =>
    ({ status }) =>
      status === TaskStatus.DisputeCreated,
  finished: () => task => !Task.isIncomplete(task) && task.status === TaskStatus.Resolved,
  incomplete: ({ skills }) => {
    const skillsMatch = createSkillsTaskMatcher(skills);
    return task => Task.isIncomplete(task) && skillsMatch(task);
  },
};

/**
 * Get a filter predicate function based on a predefined filterName.
 *
 * @param {'all'|'open'|'inProgress'|'inReview'|'inDispute'|'finished'|'incomplete'} filterName The filterName of the filter
 * @return TaskFilterPredicate a filter predicated function to be used with Array#filter.
 */
export function getStatusFilterPredicate(filterName, { skills = [] } = {}) {
  return createStatusFilterPredicates[filterName]({ skills }) ?? createStatusFilterPredicates.all({ skills });
}

/**
 * @param {'all'|'open'|'inProgress'|'inReview'|'inDispute'|'finished'|'incomplete'} filterName The name of the first level filter
 * @param {string} allTasks The name of the second level filter
 * @param {object} params
 * @param string params.account the ethereum address of the user
 * @return {TaskFilterPredicate} a filter predicated function to be used with Array#filter.
 */
export function getAllTasksFilterPredicate(allTasks, { status, account }) {
  return allTasks
    ? () => true
    : ({ parties }) =>
        !account || status === statusFilters.open
          ? true // There's no concept of "My Tasks" for tasks in Created state or when there is no wallet connected.
          : parties[TaskParty.Translator] === account || parties[TaskParty.Challenger] === account;
}

/**
 * This callback is displayed as a global member.
 * @callback TaskFilterPredicate
 * @param {object} task The task object.
 * @return {boolean} If the task should be included in the filter or not.
 */
