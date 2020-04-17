import dayjs from 'dayjs';
import TaskStatus from './TaskStatus';
import Web3 from 'web3';

const { toBN, BN } = Web3.utils;

const normalizeEventPropsFnMap = {
  TaskCreated: {
    _taskID: Number,
    _timestamp: _timestamp => dayjs.unix(_timestamp).toDate(),
  },
  TaskAssigned: {
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

const ETH_ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

const normalizePropsFnMap = {
  ID: Number,
  status: Number,
  submissionTimeout: Number,
  reviewTimeout: Number,
  lastInteraction: lastInteraction => dayjs.unix(lastInteraction).toDate(),
  deadline: deadline => dayjs.unix(deadline).toDate(),
  parties: ([_ignored, translator, challenger]) => ({
    translator: translator === ETH_ADDRESS_ZERO ? undefined : translator,
    challenger: challenger === ETH_ADDRESS_ZERO ? undefined : challenger,
  }),
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
 * @param {object} taskParts The task object parts
 * @param {string|number} taskParts.ID The Task ID
 * @param {string|number} taskParts.reviewTimeout The Task review timeout in seconds
 * @param {object} taskParts.task The Task data from the contract
 * @param {object} taskParts.metadata The Task metadata from the evidenceMetadata object
 * @param {object} taskParts.lyfecicleEvents The Task lifecycle events
 * @param {object[]} taskParts.lyfecicleEvents.TaskCreated The TaskCreated events from the contract
 * @param {object[]} taskParts.lyfecicleEvents.TranslationSubmitted The TranslationSubmitted events from the contract
 * @param {object[]} taskParts.lyfecicleEvents.TranslationChallenged The TranslationChallenged events from the contract
 * @param {object[]} taskParts.lyfecicleEvents.TaskResolved The TaskResolved events from the contract
 * @return {object} The normalized task object
 */

export const normalize = ({ ID, reviewTimeout, task, metadata, lifecyleEvents } = {}) => {
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

  data.wordCount = wordCount({ text: data.text });

  data.lifecyleEvents = extractEventsReturnValues(lifecyleEvents);

  data.assignedPrice = data.lifecyleEvents.TaskAssigned?.[0]?._price;

  return data;
};

/**
 * Calculates the word count for a given task.
 *
 * @param {object} task The task object
 * @param {string} task.text The task text
 * @return {number} The number of words in a task text
 */
export const wordCount = ({ text } = {}) => {
  const trimmedText = (text || '').trim();
  return trimmedText === '' ? 0 : trimmedText.split(/[\s\n]+/).length;
};

/**
 * Calculates the current price of a given task.
 *
 * @param {object} task The task object
 * @param {TaskStatus} task.status The task status
 * @param {string|number|BN = undefined} task.assignedPrice The task assigned price
 * @param {string|number|BN} task.minPrice The task minimum price
 * @param {string|number|BN} task.maxPrice The task maximum price
 * @param {string|Date} task.lastInteraction The task last interaction date
 * @param {number} task.submissionTimeout The task submission timeout in seconds
 * @param {object={}} options The options object
 * @param {string|Date = new Date()} currentDate The current date.
 * @return {string} The price per word of the task if `wordCount` greater than `0`; otherwise returns `currentPrice`
 */
export const currentPrice = (
  { status, assignedPrice, minPrice, maxPrice, lastInteraction, submissionTimeout } = {},
  { currentDate = new Date() } = {}
) => {
  if (assignedPrice !== undefined || assignedPrice === '') {
    return assignedPrice;
  }

  let timeSinceLastInteraction = dayjs(currentDate).diff(dayjs(lastInteraction), 'second');
  if (status !== TaskStatus.Created || timeSinceLastInteraction > submissionTimeout) {
    return '0';
  }

  minPrice = toBN(String(minPrice));
  maxPrice = toBN(String(maxPrice));
  timeSinceLastInteraction = toBN(String(timeSinceLastInteraction));
  submissionTimeout = toBN(String(submissionTimeout));

  const currentPrice = minPrice.add(maxPrice.sub(minPrice).mul(timeSinceLastInteraction).div(submissionTimeout));

  return String(BN.min(currentPrice, maxPrice));
};

/**
 * Calculates the current price per word of a given task.
 *
 * @param {object} task The task object
 * @param {TaskStatus} task.status The task status
 * @param {string|number|BN = undefined} task.assignedPrice The task assigned price
 * @param {string|number|BN} task.minPrice The task minimum price
 * @param {string|number|BN} task.maxPrice The task maximum price
 * @param {string|Date} task.lastInteraction The task last interaction date
 * @param {number} task.submissionTimeout The task submission timeout in seconds
 * @param {number} task.wordCount The task word count
 * @param {object={}} options The options object
 * @param {string|Date = new Date()} currentDate The current date.
 * @return {string} The price per word of the task if `wordCount` greater than `0`. Otherwise, returns `currentPrice`
 */
export const currentPricePerWord = (
  { status, assignedPrice, minPrice, maxPrice, lastInteraction, submissionTimeout, wordCount } = {},
  { currentDate = new Date() } = {}
) => {
  const currentPriceValue = currentPrice(
    { status, assignedPrice, minPrice, maxPrice, lastInteraction, submissionTimeout, wordCount },
    { currentDate }
  );
  return String(wordCount > 0 ? toBN(currentPriceValue).div(toBN(String(wordCount))) : currentPrice);
};

/**
 * Calculates the remaining submission time for a given task.
 *
 * @param {object} task The task object
 * @param {TaskStatus} task.status The task status
 * @param {Date|number|dayjs} task.lastInteraction The task last interaction value
 * @param {number} task.submissionTimeout The task submission timeout value in seconds
 * @param {object} options The options object
 * @param {'milissecond'|'second'|'minute'|'hour'|'day'|'month'|'year'} options.unit The time resolution to calculate the difference
 * @param {string|Date = new Date()} currentDate The current date.
 * @return {number} The remaining time for submission in the specified `unit`
 */
export const remainingTimeForSubmission = (
  { status, lastInteraction, submissionTimeout } = {},
  { unit = 'second', currentDate = new Date() } = {}
) => {
  if (![TaskStatus.Created, TaskStatus.Assigned].includes(status)) {
    return 0;
  }

  const realDeadline = dayjs(lastInteraction).add(submissionTimeout, 'second');
  const remainingTimeout = realDeadline.diff(dayjs(currentDate), unit);

  return remainingTimeout > 0 ? remainingTimeout : 0;
};

/**
 * Calculates the remaining review time for a given task.
 *
 * @param {object} task The task object
 * @param {TaskStatus} task.status The task status
 * @param {Date|number|dayjs} task.lastInteraction The task last interaction value
 * @param {number} task.reviewTimeout The task review timeout value in seconds
 * @param {object} options The options object
 * @param {'milissecond'|'second'|'minute'|'hour'|'day'|'month'|'year'} options.unit The time resolution to calculate the difference
 * @param {string|Date = new Date()} currentDate The current date.
 * @return {number} The remaining time for review in the specified `unit`
 */
export const remainingTimeForReview = (
  { status, lastInteraction, reviewTimeout } = {},
  { unit = 'second', currentDate = new Date() } = {}
) => {
  if (TaskStatus.AwaitingReview !== status) {
    return 0;
  }

  const realDeadline = dayjs(lastInteraction).add(reviewTimeout, 'second');
  const remainingTimeout = realDeadline.diff(dayjs(currentDate), unit);

  return remainingTimeout > 0 ? remainingTimeout : 0;
};

/**
 * Returns if a task was incomplete either by not having any interaction from a translator,
 * or if the assigned translator did not send the translation within the specified prediod.
 *
 * @param {object} task The task object
 * @param {TaskStatus} task.status The task status
 * @param {Date|number|dayjs} task.submissionTimeout The task last interaction value
 * @param {Date|number|dayjs} task.lastInteraction The task last interaction value
 * @param {number} task.reviewTimeout The task review timeout value in seconds
 * @return {boolean} Whether the translation task was incomplete or not
 */
export const isIncomplete = ({ status, lastInteraction, submissionTimeout, lifecyleEvents } = {}) => {
  if (status === TaskStatus.Resolved) {
    return lifecyleEvents?.TranslationSubmitted?.length === 0;
  }

  if ([TaskStatus.Created, TaskStatus.Assigned].includes(status)) {
    return dayjs(lastInteraction).add(submissionTimeout, 'second').isBefore(dayjs());
  }

  return false;
};

/**
 * Returns if a transltion task is still pending.
 *
 * @param {object} task The task object
 * @param {TaskStatus} task.status The task status
 * @return {boolean} Whether the translation task is pending or not
 */
export const isPending = ({ status } = {}) => {
  return [TaskStatus.Created, TaskStatus.Assigned].includes(status);
};
