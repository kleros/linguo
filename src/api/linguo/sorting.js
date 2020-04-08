import { remainingTimeForReview, remainingTimeForSubmission, isAborted } from './entities/Task';

function createComparator(descriptor = {}) {
  const customSorting = (a, b) =>
    Object.entries(descriptor).reduce((acc, [prop, signOrComparator]) => {
      const hasDefinedSortOrder = acc !== 0;
      return hasDefinedSortOrder
        ? acc
        : typeof signOrComparator === 'number'
        ? signOrComparator * (b[prop] - a[prop])
        : signOrComparator(a, b);
    }, 0);

  return customSorting;
}

const comparatorMap = {
  all: {
    aborted: (a, b) => isAborted(a) - isAborted(b),
    remainingTimeForSubmission: (a, b) => remainingTimeForSubmission(a) - remainingTimeForSubmission(b),
    ID: -1,
  },
  open: {
    currentPricePerWord: -1,
    ID: -1,
  },
  inProgress: {
    remainingTimeForSubmission: (a, b) => remainingTimeForSubmission(b) - remainingTimeForSubmission(a),
    ID: -1,
  },
  inReview: {
    remainingTimeForReview: (a, b) => remainingTimeForReview(b) - remainingTimeForReview(a),
    ID: -1,
  },
  inDispute: {
    disputeID: -1,
  },
  finished: {
    ID: -1,
  },
  aborted: {
    lastInteraction: -1,
    ID: 1,
  },
};

/**
 * This callback is displayed as a global member.
 * @callback TaskComparator
 * @param {object} a A task object.
 * @param {object} b A task object.
 * @return {number} A number indicating the sort order compatible with Array#sort()
 */

/**
 * Get a filter predicate function based on a predefined name.
 *
 * @param {'all'|'open'|'inProgress'|'inReview'|'inDispute'|'finished'|'aborted'} filterName The name of the filter
 * @return TaskComparator a filter predicated function to be used with Array#filter.
 */
export default function getComparator(filterName) {
  const comparator = comparatorMap[filterName];
  return createComparator(comparator || comparatorMap.all);
}
