import taskStatus from '~/consts/taskStatus';
import moment from 'moment';
import { BigNumber } from 'ethers';
import { TaskParty } from '~/features/tasks';

const isIncomplete = (status, translation, lastInteraction, submissionTimeout) => {
  if (status === taskStatus.Resolved) {
    return translation === '';
  }

  const currentDate = moment();
  lastInteraction = moment.unix(lastInteraction);
  submissionTimeout = moment.unix(submissionTimeout);

  if (isPending(status)) {
    return lastInteraction.add(submissionTimeout).isBefore(currentDate);
  }

  return false;
};

const isInProgress = (status, translation, lastInteraction, submissionTimeout) => {
  return status === taskStatus.Assigned && !Task.isIncomplete(status, translation, lastInteraction, submissionTimeout);
};

const isFinalized = (status, translation, lastInteraction, submissionTimeout) => {
  return status === taskStatus.Resolved || isIncomplete(status, translation, lastInteraction, submissionTimeout);
};

const isPending = status => {
  return [taskStatus.Created, taskStatus.Assigned].includes(status);
};

const isCompleted = (status, translation, lastInteraction, submissionTimeout) => {
  return status === taskStatus.Resolved && !isIncomplete(status, translation, lastInteraction, submissionTimeout);
};

const isOpen = (status, translation, lastInteraction, submissionTimeout) => {
  return status === taskStatus.Created && !isIncomplete(status, translation, lastInteraction, submissionTimeout);
};

const getCurrentPrice = (assignedPrice, minPrice, maxPrice, lastInteraction, submissionTimeout) => {
  if (!BigNumber.from(assignedPrice).isZero()) return assignedPrice;

  const currentTime = moment();
  const lastInteractionMoment = moment.unix(lastInteraction);
  const submissionTimeoutMoment = moment.unix(submissionTimeout);
  let timeSinceLastInteraction = currentTime.subtract(lastInteractionMoment);

  if (timeSinceLastInteraction.isAfter(submissionTimeoutMoment)) return maxPrice;

  minPrice = BigNumber.from(minPrice);
  maxPrice = BigNumber.from(maxPrice);

  timeSinceLastInteraction = BigNumber.from(timeSinceLastInteraction.unix());
  submissionTimeout = BigNumber.from(submissionTimeoutMoment.unix());

  const currentPrice = minPrice.add(maxPrice.sub(minPrice).mul(timeSinceLastInteraction).div(submissionTimeout));
  return currentPrice.lt(maxPrice) ? currentPrice.toString() : maxPrice.toString();
};

const getCurrentPricePerWord = (currentPrice, wordCount) => {
  if (wordCount === 0) return currentPrice.toString();

  currentPrice = BigNumber.from(currentPrice);
  wordCount = BigNumber.from(wordCount);

  return currentPrice.div(wordCount).toString();
};

const getRemainedSubmissionTime = (status, deadline) => {
  if (![taskStatus.Created, taskStatus.Assigned].includes(status)) {
    return 0;
  }

  const currentTime = moment();
  const deadlineMoment = moment(deadline);

  const remainingTimeout = deadlineMoment.subtract(currentTime);
  return remainingTimeout.unix() > 0 ? remainingTimeout.unix() : 0;
};

const getRemainedReviewTime = (status, lastInteraction, reviewTimeout) => {
  if (taskStatus.AwaitingReview !== status) {
    return 0;
  }
  const currentTime = moment();
  reviewTimeout = moment.unix(reviewTimeout);
  const deadlineMoment = moment.unix(lastInteraction).add(reviewTimeout);

  const remainingTimeout = deadlineMoment.subtract(currentTime);
  return remainingTimeout.unix() > 0 ? remainingTimeout.unix() : 0;
};

const getCurrentParty = (account, requester, translator, challenger) => {
  switch (account) {
    /**
     * The requester could also be the challenger.
     * If that happens, the role he should assume is the one
     * of challenger, so he can better informed of next steps.
     * That's why challenger is matched before requester here.
     */
    case challenger:
      return TaskParty.Challenger;
    case requester:
      return TaskParty.Requester;
    case translator:
      return TaskParty.Translator;
    default:
      return TaskParty.Other;
  }
};

const Task = {
  isCompleted,
  isIncomplete,
  isInProgress,
  isFinalized,
  isOpen,
  isPending,
  getCurrentParty,
  getCurrentPrice,
  getCurrentPricePerWord,
  getRemainedSubmissionTime,
  getRemainedReviewTime,
};
export default Task;
