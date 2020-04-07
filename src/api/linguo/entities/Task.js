import dayjs from 'dayjs';
import TaskStatus from './TaskStatus';

export const calculateRemainingSubmitTimeInSeconds = ({ status, lastInteraction, submissionTimeout }) => {
  if (TaskStatus.Created !== status) {
    return 0;
  }

  const realDeadline = dayjs(lastInteraction).add(submissionTimeout, 'second');
  const remainingTimeout = realDeadline.diff(dayjs(), 'second');

  return remainingTimeout > 0 ? remainingTimeout : 0;
};

export const calculateRemainingReviewTimeInSeconds = ({ status, lastInteraction, reviewTimeout }) => {
  if (TaskStatus.AwaitingReview !== status) {
    return 0;
  }

  const realDeadline = dayjs(lastInteraction).add(reviewTimeout, 'second');
  const remainingTimeout = realDeadline.diff(dayjs(), 'second');

  return remainingTimeout > 0 ? remainingTimeout : 0;
};

export const isAborted = ({ status, lastInteraction, submissionTimeout, translationSubmittedEvents }) => {
  if (status === TaskStatus.Resolved) {
    return translationSubmittedEvents.length === 0;
  }

  if ([TaskStatus.Created, TaskStatus.Assigned].includes(status)) {
    return dayjs(lastInteraction).add(submissionTimeout, 'second').isBefore(dayjs());
  }

  return false;
};
