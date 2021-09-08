import { Task } from '~/features/tasks';
import Web3 from 'web3';

const { toBN } = Web3.utils;

/**
 * Get a filter predicate function based on a predefined name.
 *
 * @param {'all'|'open'|'inProgress'|'inReview'|'inDispute'|'finished'|'incomplete'} filterName The name of the filter
 * @return TaskComparator a filter predicated function to be used with Array#filter.
 */
export function getComparator(filterName) {
  const comparator = comparatorMap[filterName];
  return createComparator(comparator || comparatorMap.all);
}

function createComparator(descriptor = {}) {
  const customSorting = (a, b) =>
    Object.entries(descriptor).reduce((order, [prop, signOrComparator]) => {
      const hasDefinedOrder = order !== 0;
      const primitiveComparator = primitiveTypeToComparator[typeof a[prop]] ?? primitiveTypeToComparator.number;

      return hasDefinedOrder
        ? order
        : typeof signOrComparator === 'number'
        ? signOrComparator * primitiveComparator(a[prop], b[prop])
        : signOrComparator(a, b);
    }, 0);

  return customSorting;
}

const primitiveTypeToComparator = {
  number: (a, b) => b - a,
  string: (a, b) => a.localeCompare(b),
  boolean: (a, b) => b - a,
};

const sortBNAscending = (a, b) => (a.gt(b) ? 1 : b.gt(a) ? -1 : 0);

const sortBNDescending = (a, b) => -1 * sortBNAscending(a, b);

const comparatorMap = {
  all: {
    incompleteLast: (a, b) => Task.isIncomplete(a) - Task.isIncomplete(b),
    id: -1,
  },
  open: {
    currentPricePerWordDesc: (a, b) => {
      const currentDate = new Date();
      return sortBNDescending(
        toBN(Task.currentPricePerWord({ ...a, currentPrice: Task.currentPrice(a, { currentDate }) })),
        toBN(Task.currentPricePerWord({ ...b, currentPrice: Task.currentPrice(b, { currentDate }) }))
      );
    },
    id: -1,
  },
  inProgress: {
    remainingTimeForSubmissionDesc: (a, b) => {
      const currentDate = new Date();
      return (
        -1 * (Task.remainingTimeForSubmission(b, { currentDate }) - Task.remainingTimeForSubmission(a, { currentDate }))
      );
    },
    id: -1,
  },
  inReview: {
    remainingTimeForReviewDesc: (a, b) => {
      const currentDate = new Date();
      return -1 * (Task.remainingTimeForReview(b, { currentDate }) - Task.remainingTimeForReview(a, { currentDate }));
    },
    id: -1,
  },
  inDispute: {
    disputeID: -1,
  },
  finished: {
    id: -1,
  },
  incomplete: {
    status: -1,
    lastInteraction: -1,
    id: -1,
  },
};

/**
 * This callback is displayed as a global member.
 * @callback TaskComparator
 * @param {object} a A task object.
 * @param {object} b A task object.
 * @return {number} A number indicating the sort order compatible with Array#sort()
 */
