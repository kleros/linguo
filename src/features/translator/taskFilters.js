import { Task, TaskParty, TaskStatus } from '~/features/tasks';
import { createSkillsTaskMatcher } from './skillsMatchTask';

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

const createFilterPredicates = {
  all: () => () => true,
  open: () => task => !Task.isIncomplete(task) && task.status === TaskStatus.Created,
  inProgress: () => task => !Task.isIncomplete(task) && task.status === TaskStatus.Assigned,
  inReview: () => ({ status }) => status === TaskStatus.AwaitingReview,
  inDispute: () => ({ status }) => status === TaskStatus.DisputeCreated,
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
export function getFilterPredicate(filterName, { skills = [] } = {}) {
  return createFilterPredicates[filterName]({ skills }) ?? createFilterPredicates.all({ skills });
}

const DEFAULT_FILTER = Symbol('@@default-filter');

export const secondLevelFilters = {
  [filters.inProgress]: {
    [DEFAULT_FILTER]: 'myTranslations',
    myTranslations: 'myTranslations',
    others: 'others',
  },
  [filters.inReview]: {
    [DEFAULT_FILTER]: 'toReview',
    toReview: 'toReview',
    myTranslations: 'myTranslations',
  },
  [filters.inDispute]: {
    [DEFAULT_FILTER]: 'translated',
    translated: 'translated',
    challenged: 'challenged',
    others: 'others',
  },
  [filters.finished]: {
    [DEFAULT_FILTER]: 'translated',
    translated: 'translated',
    challenged: 'challenged',
    others: 'others',
  },
  [filters.incomplete]: {
    [DEFAULT_FILTER]: 'assigned',
    assigned: 'assigned',
    others: 'others',
  },
};

export function getSecondLevelFilter(filterName, secondLevelFilterName) {
  const firstLevel = secondLevelFilters[filterName];
  return firstLevel?.[secondLevelFilterName] ?? firstLevel?.[DEFAULT_FILTER];
}

export function hasSecondLevelFilters(filterName) {
  return secondLevelFilters[filterName] !== undefined;
}

/**
 * @param {'all'|'open'|'inProgress'|'inReview'|'inDispute'|'finished'|'incomplete'} filterName The name of the first level filter
 * @param {string} secondLevelFilterName The name of the second level filter
 * @param {object} params
 * @param string params.account the ethereum address of the user
 * @return {TaskFilterPredicate} a filter predicated function to be used with Array#filter.
 */
export function getSecondLevelFilterPredicate(filterName, secondLevelFilterName, { account }) {
  const secondLevelFilterPredicates = {
    [filters.inProgress]: {
      myTranslations: ({ parties }) => parties[TaskParty.Translator] === account,
      othes: ({ parties }) => parties[TaskParty.Translator] !== account,
    },
    [filters.inReview]: {
      toReview: ({ parties }) => parties[TaskParty.Translator] !== account,
      myTranslations: ({ parties }) => parties[TaskParty.Translator] === account,
    },
    [filters.inDispute]: {
      translated: ({ parties }) => parties[TaskParty.Translator] === account,
      challenged: ({ parties }) => parties[TaskParty.Challenger] === account,
      others: ({ parties }) => parties[TaskParty.Translator] !== account && parties[TaskParty.Challenger] !== account,
    },
    [filters.finished]: {
      translated: ({ parties }) => parties[TaskParty.Translator] === account,
      challenged: ({ parties }) => parties[TaskParty.Challenger] === account,
      others: ({ parties }) => parties[TaskParty.Translator] !== account && parties[TaskParty.Challenger] !== account,
    },
    [filters.incomplete]: {
      assigned: ({ parties }) => parties[TaskParty.Translator] === account,
      others: ({ parties }) => parties[TaskParty.Translator] !== account,
    },
  };

  return secondLevelFilterPredicates[filterName]?.[secondLevelFilterName] ?? allPass;
}

const allPass = () => true;

/**
 * This callback is displayed as a global member.
 * @callback TaskFilterPredicate
 * @param {object} task The task object.
 * @return {boolean} If the task should be included in the filter or not.
 */
