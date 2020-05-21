import produce from 'immer';
import dayjs from 'dayjs';
import Web3 from 'web3';
import ipfs from '~/app/ipfs';
import TaskStatus from './TaskStatus';
import TaskParty from './TaskParty';
import TaskResolveReason from './TaskResolveReason';
import DisputeRuling from './DisputeRuling';

const { toBN, BN } = Web3.utils;

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
 * @function
 *
 * @param {TaskInput} taskParts The task object parts
 * @return {Task} The normalized task object
 */

export const normalize = ({ ID, reviewTimeout, task, metadata, lifecycleEvents } = {}) => {
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

  data.lifecycleEvents = extractEventsReturnValues(lifecycleEvents);

  data.assignedPrice = data.lifecycleEvents.TaskAssigned?.[0]?._price;

  const translatedText = data.lifecycleEvents.TranslationSubmitted?.[0]?._translatedText;
  if (translatedText) {
    data.translatedTextUrl = ipfs.generateUrl(translatedText);
  }

  data.hasDispute = (data.lifecycleEvents.Dispute?.length ?? 0) > 0;
  /**
   * If there was never a dispute, the `ruling` field of the task will not be set.
   * To normalize the expected behavior, we will derive what would be the ruling
   * from the `TaskResolved` event.
   */
  if (data.status === TaskStatus.Resolved && !data.hasDispute) {
    const reason = data.lifecycleEvents.TaskResolved?.[0]?._reason;
    if (reason === TaskResolveReason.TranslationAccepted) {
      data.ruling = DisputeRuling.TranslationApproved;
    } else if (reason === TaskResolveReason.RequesterReimbured) {
      data.ruling = DisputeRuling.TranslationRejected;
    }
  }

  return data;
};

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
  Dispute: {
    _disputeID: Number,
    _metaEvidenceID: Number,
    _evidenceGroupID: Number,
  },
};

const extractEventsReturnValues = (lifecycleEvents = {}) =>
  Object.entries(lifecycleEvents).reduce(
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
  status: TaskStatus.of,
  submissionTimeout: Number,
  reviewTimeout: Number,
  lastInteraction: lastInteraction => dayjs.unix(lastInteraction).toDate(),
  deadline: deadline => dayjs.unix(deadline).toDate(),
  parties: ([_ignored, translator, challenger]) => ({
    [TaskParty.Translator]: translator === ETH_ADDRESS_ZERO ? undefined : translator,
    [TaskParty.Challenger]: challenger === ETH_ADDRESS_ZERO ? undefined : challenger,
  }),
  disputeID: Number,
  ruling: DisputeRuling.of,
};

/**
 * Calculates the word count for a given task.
 *
 * @function
 *
 * @param {Object} task The partial task object
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
 * @function
 *
 * @param {Object} task The partial task object
 * @param {string|number|BN} task.assignedPrice The task assigned price
 * @param {TaskStatus} task.status The task status
 * @param {string|number|BN} task.minPrice The task minimum price
 * @param {string|number|BN} task.maxPrice The task maximum price
 * @param {string|Date} task.lastInteraction The task last interaction date
 * @param {number} task.submissionTimeout The task submission timeout in seconds
 * @param {Object} [options={}] The options object
 * @param {string|Date} options.currentDate The current date.
 * @return {string} The price per word of the task if `wordCount` greater than `0`; otherwise returns `currentPrice`
 */
export const currentPrice = (
  { assignedPrice, status, minPrice, maxPrice, lastInteraction, submissionTimeout } = {},
  { currentDate = new Date() } = {}
) => {
  if (![undefined, null, ''].includes(assignedPrice)) {
    return assignedPrice;
  }

  let timeSinceLastInteraction = dayjs(currentDate).diff(dayjs(lastInteraction), 'second');
  if (timeSinceLastInteraction > submissionTimeout) {
    return maxPrice;
  }

  if (status !== TaskStatus.Created) {
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
 * @function
 *
 * @param {Task|TaskWithDefinedPrice} taskOrParams The task object or an object containing the current price and the word count
 * @param {Object} [options={}] The options object
 * @param {string|Date} [options.currentDate=new Date()] The current date
 * @return {string} The price per word of the task if `wordCount` greater than `0`. Otherwise, returns `currentPrice`
 */
export const currentPricePerWord = (
  {
    currentPrice: currentPriceFromArgs,
    status,
    assignedPrice,
    minPrice,
    maxPrice,
    lastInteraction,
    submissionTimeout,
    wordCount,
  } = {},
  { currentDate = new Date() } = {}
) => {
  const currentPriceValue =
    currentPriceFromArgs ??
    currentPrice(
      { status, assignedPrice, minPrice, maxPrice, lastInteraction, submissionTimeout, wordCount },
      { currentDate }
    );
  return String(wordCount > 0 ? toBN(currentPriceValue).div(toBN(String(wordCount))) : currentPrice);
};

/**
 * Calculates the remaining submission time for a given task.
 *
 * @function
 *
 * @param {Object} task The task object
 * @param {TaskStatus} task.status The task status
 * @param {Date|number|dayjs} task.lastInteraction The task last interaction value
 * @param {number} task.submissionTimeout The task submission timeout value in seconds
 * @param {Object} options The options object
 * @param {'millisecond'|'second'|'minute'|'hour'|'day'|'month'|'year'} options.unit The time resolution to calculate the difference
 * @param {string|Date} [options.currentDate=new Date()] The current date.
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
 * @function
 *
 * @param {Object} task The task object
 * @param {TaskStatus} task.status The task status
 * @param {Date|number|dayjs} task.lastInteraction The task last interaction value
 * @param {number} task.reviewTimeout The task review timeout value in seconds
 * @param {Object} options The options object
 * @param {'millisecond'|'second'|'minute'|'hour'|'day'|'month'|'year'} options.unit The time resolution to calculate the difference
 * @param {string|Date} [options.currentDate=new Date()] The current date.
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
 * @function
 *
 * @param {Object} task The task object
 * @param {TaskStatus} task.status The task status
 * @param {Date|number|dayjs} task.submissionTimeout The task last interaction value
 * @param {Date|number|dayjs} task.lastInteraction The task last interaction value
 * @param {number} task.reviewTimeout The task review timeout value in seconds
 * @return {boolean} Whether the translation task was incomplete or not
 */
export const isIncomplete = ({ status, lastInteraction, submissionTimeout, lifecycleEvents } = {}) => {
  if (status === TaskStatus.Resolved) {
    const translationSubmittedEventCount = lifecycleEvents?.TranslationSubmitted?.length ?? 0;
    return translationSubmittedEventCount === 0;
  }

  if ([TaskStatus.Created, TaskStatus.Assigned].includes(status)) {
    return dayjs(lastInteraction).add(submissionTimeout, 'second').isBefore(dayjs());
  }

  return false;
};

/**
 * Returns if a transltion task is still pending.
 *
 * @function
 *
 * @param {Object} task The task object
 * @param {TaskStatus} task.status The task status
 * @return {boolean} Whether the translation task is pending or not
 */
export const isPending = ({ status } = {}) => {
  return [TaskStatus.Created, TaskStatus.Assigned].includes(status);
};

/**
 * Returns an updated Task object as if it was assigned.
 * Notice that `task` input is not mutated.
 *
 * @function
 *
 * @param {Task} task The task object
 * @param {Object} params The update params
 * @param {string} params.account The account which assigned to the task
 * @return {Task} The updated task object
 */
export const registerAssignment = (task, { account }) =>
  produce(task, draft => {
    draft.status = TaskStatus.Assigned;
    draft.parties[TaskParty.Translator] = account;
  });

/**
 * Returns an updated Task object as if the translation was submitted.
 * Notice that `task` input is not mutated.
 *
 * @function
 *
 * @param {Task} task The task object
 * @param {Object} params The update params
 * @param {Date} params.currentDate The date in which the submission was made
 * @return {Task} The updated task object
 */
export const registerSubmission = (task, { currentDate = new Date() } = {}) =>
  produce(task, draft => {
    draft.status = TaskStatus.AwaitingReview;
    draft.lastInteraction = currentDate;
  });

/**
 * Returns an updated Task object as if the translation was challenged.
 * Notice that `task` input is not mutated.
 *
 * @function
 *
 * @param {Task} task The task object
 * @param {Object} params The update params
 * @param {Date} params.account The account which challenged the translation
 * @return {Task} The updated task object
 */
export const registerChallenge = (task, { account }) =>
  produce(task, draft => {
    draft.status = TaskStatus.DisputeCreated;
    draft.parties[TaskParty.Challenger] = account;
  });

/**
 * Returns an updated Task object as if the translation was approved.
 * Notice that `task` input is not mutated.
 *
 * @function
 *
 * @param {Task} task The task object
 * @return {Task} The updated task object
 */
export const registerApproval = task =>
  produce(task, draft => {
    draft.status = TaskStatus.Resolved;
    draft.ruling = DisputeRuling.TranslationApproved;
  });

/**
 * Returns an updated Task object as if the translation was rejected.
 * Notice that `task` input is not mutated.
 *
 * @function
 *
 * @param {Task} task The task object
 * @return {Task} The updated task object
 */
export const registerReimbursement = task =>
  produce(task, draft => {
    draft.status = TaskStatus.Resolved;
    draft.ruling = DisputeRuling.TranslationRejected;
  });

/**
 *
 * @typedef {Object} Task The task object
 * @prop {TaskStatus} status The task status
 * @prop {string} [assignedPrice] The task assigned price
 * @prop {string} minPrice The task minimum price
 * @prop {string} maxPrice The task maximum price
 * @prop {string} text The original text to be translated
 * @prop {number} wordCount The task word count
 * @prop {string} requester The requester address, if exists
 * @prop {Object} parties The parties regarding the task
 * @prop {string} [parties[TaskParty.Translator]] The translator address, if exists
 * @prop {string} [parties[TaskParty.Challenger]] The challenger address, if exists
 * @prop {Date} lastInteraction The task last interaction date
 * @prop {number} submissionTimeout The task submission timeout in seconds
 * @prop {number} reviewTimeout The task review timeout in seconds
 * @prop {boolean} hasDispute Whether the task has a dispute or not
 * @prop {number} ruling The dispute ruling
 */

/**
 * @typedef {Object} TaskWithDefinedPrice The task params object
 * @prop {string|number|BN} currentPrice The task minimum price
 * @prop {number} wordCount The task word count
 */

/**
 * @typedef {Object} TaskInput The parts that form a Task object
 * @prop {string|number} ID The Task ID
 * @prop {string|number} reviewTimeout The Task review timeout in seconds
 * @prop {Object} task The Task data from the contract
 * @prop {Object} metadata The Task metadata from the evidenceMetadata object
 * @prop {Object} lifecycleEvents The Task lifecycle events
 * @prop {Object[]} lifecycleEvents.TaskCreated The TaskCreated events from the contract
 * @prop {Object[]} lifecycleEvents.TranslationSubmitted The TranslationSubmitted events from the contract
 * @prop {Object[]} lifecycleEvents.TranslationChallenged The TranslationChallenged events from the contract
 * @prop {Object[]} lifecycleEvents.TaskResolved The TaskResolved events from the contract
 */
