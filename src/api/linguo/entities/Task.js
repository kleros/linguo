import dayjs from 'dayjs';
import TaskStatus from './TaskStatus';
import Web3 from 'web3';

const { toBN } = Web3.utils;

const normalizeEventPropsFnMap = {
  TaskCreated: {
    _taskID: Number,
    _timestamp: _timestamp => dayjs.unix(_timestamp).toDate(),
  },
  TranslationSubmitted: {
    _taskID: Number,
    _timestamp: _timestamp => dayjs.unix(_timestamp).toDate(),
  },
  TranslationChallenged: {
    _taskID: Number,
    _timestamp: _timestamp => dayjs.unix(_timestamp).toDate(),
  },
  TaskResolved: {
    _taskID: Number,
    _timestamp: _timestamp => dayjs.unix(_timestamp).toDate(),
  },
};

const extractEventsReturnValues = lifecyleEvents =>
  Object.entries(lifecyleEvents).reduce(
    (acc, [eventName, occurrences]) =>
      Object.assign(acc, {
        [eventName]: occurrences.map(({ returnValues }) =>
          Object.entries(returnValues).reduce((innerAcc, [prop, value]) => {
            const normalize = normalizeEventPropsFnMap[eventName][prop];
            const isNumericProp = !Number.isNaN(Number(prop));
            return isNumericProp
              ? innerAcc
              : Object.assign(innerAcc, {
                  [prop]: normalize ? normalize(value) : value,
                });
          }, {})
        ),
      }),
    {}
  );

const normalizePropsFnMap = {
  ID: Number,
  status: Number,
  submissionTimeout: Number,
  reviewTimeout: Number,
  lastInteraction: lastInteraction => dayjs.unix(lastInteraction).toDate(),
  // Deadline is stored in metadata JSON as a ISO-8601 date.
  deadline: deadline => dayjs(deadline).toDate(),
  parties: ([_ignored, translator, challenger]) => ({ translator, challenger }),
  disputeID: Number,
  ruling: Number,
};

/**
 * Normalize task data to use JS-friendly types.
 *
 * For example, task IDs are declared as `uint` in Linguo smart contract.
 * This causes this prop to be returned as a string, because `uint`s cannot
 * be directly converted to `number`, since `uint` can represent numbers up to
 * 2^256 - 1, while JS `number` is much smaller, representing up to 2^53-1 integers.
 *
 * However it's very unlikely that more than 2^53-1 tasks will ever be created in
 * this contract, so we can safely convert the returned `uint` string representation
 * to a native JS `number`.
 *
 * @param {object} taskParts The Task object parts
 * @param {string|number} taskParts.ID The Task ID
 * @param {string|number} taskParts.reviewTimeout The Task review timeout in seconds
 * @param {object} taskParts.task The Task data from the contract
 * @param {object} taskParts.metadata The Task metadata from the evidenceMetadata object
 * @param {object} taskParts.lyfecicleEvents The Task lifecycle events
 * @param {object[]} taskParts.lyfecicleEvents.TaskCreated The TaskCreated events from the contract
 * @param {object[]} taskParts.lyfecicleEvents.TranslationSubmitted The TranslationSubmitted events from the contract
 * @param {object[]} taskParts.lyfecicleEvents.TranslationChallenged The TranslationChallenged events from the contract
 * @param {object[]} taskParts.lyfecicleEvents.TaskResolved The TaskResolved events from the contract
 * @return {object} The normalized Task object
 */

export const normalize = ({ ID, reviewTimeout, task, metadata, lifecyleEvents }) => {
  const data = Object.entries({
    ID,
    ...metadata,
    ...task,
    reviewTimeout,
  }).reduce((acc, [prop, value]) => {
    const isNumericProp = !Number.isNaN(Number(prop));
    return isNumericProp
      ? acc
      : Object.assign(acc, {
          [prop]: normalizePropsFnMap[prop] ? normalizePropsFnMap[prop](value) : value,
        });
  }, {});

  data.wordCount = (data.text || '').split(/\s+/g).length;
  data.currentPrice = getCurrentPrice(data);
  data.currentPricePerWord =
    data.wordCount > 0
      ? toBN(data.currentPrice)
          .div(toBN(String(data.wordCount)))
          .toString()
      : +Infinity;

  data.lifecyleEvents = extractEventsReturnValues(lifecyleEvents);

  return data;
};

export const getCurrentPrice = ({ status, minPrice, maxPrice, lastInteraction, submissionTimeout }) => {
  let timeSinceLastInteraction = dayjs().diff(dayjs(lastInteraction), 'second');
  if (status !== TaskStatus.Created || timeSinceLastInteraction > submissionTimeout) {
    return '0';
  }

  minPrice = toBN(minPrice);
  maxPrice = toBN(maxPrice);
  timeSinceLastInteraction = toBN(timeSinceLastInteraction);
  submissionTimeout = toBN(submissionTimeout);

  return minPrice.add(maxPrice.sub(minPrice).mul(timeSinceLastInteraction).div(submissionTimeout)).toString();
};

/**
 * Calculates the remaining submission time for a given task.
 *
 * @param {object} task The Task object
 * @param {number} task.status The task status
 * @param {Date|number|dayjs} task.lastInteraction The task last interaction value
 * @param {number} task.submissionTimeout The task submission timeout value in seconds
 * @param {object} options The options object
 * @param {'milissecond'|'second'|'minute'|'hour'|'day'|'month'|'year'} options.unit The time resolution to calculate the difference
 * @return {number} The remaining time for submission in the specified `unit`
 */
export const remainingTimeForSubmission = (
  { status, lastInteraction, submissionTimeout } = {},
  { unit = 'second' } = {}
) => {
  if (TaskStatus.Created !== status) {
    return 0;
  }

  const realDeadline = dayjs(lastInteraction).add(submissionTimeout, 'second');
  const remainingTimeout = realDeadline.diff(dayjs(), unit);

  return remainingTimeout > 0 ? remainingTimeout : 0;
};

/**
 * Calculates the remaining review time for a given task.
 *
 * @param {object} task The Task object
 * @param {number} task.status The task status
 * @param {Date|number|dayjs} task.lastInteraction The task last interaction value
 * @param {number} task.reviewTimeout The task review timeout value in seconds
 * @param {object} options The options object
 * @param {'milissecond'|'second'|'minute'|'hour'|'day'|'month'|'year'} options.unit The time resolution to calculate the difference
 * @return {number} The remaining time for review in the specified `unit`
 */
export const remainingTimeForReview = ({ status, lastInteraction, reviewTimeout } = {}, { unit = 'second' } = {}) => {
  if (TaskStatus.AwaitingReview !== status) {
    return 0;
  }

  const realDeadline = dayjs(lastInteraction).add(reviewTimeout, 'second');
  const remainingTimeout = realDeadline.diff(dayjs(), unit);

  return remainingTimeout > 0 ? remainingTimeout : 0;
};

/**
 * Returns if a task was aborted either by not having any interaction from a translator,
 * or if the assigned translator did not send the translation within the specified prediod.
 *
 * @param {object} task The Task object
 * @param {number} task.status The task status
 * @param {Date|number|dayjs} task.submissionTimeout The task last interaction value
 * @param {Date|number|dayjs} task.lastInteraction The task last interaction value
 * @param {number} task.reviewTimeout The task review timeout value in seconds
 * @return {boolean} Whether the translation task was aborted or not
 */
export const isAborted = ({ status, lastInteraction, submissionTimeout, lifecyleEvents }) => {
  if (status === TaskStatus.Resolved) {
    return lifecyleEvents.TranslationSubmitted.length === 0;
  }

  if ([TaskStatus.Created, TaskStatus.Assigned].includes(status)) {
    return dayjs(lastInteraction).add(submissionTimeout, 'second').isBefore(dayjs());
  }

  return false;
};
