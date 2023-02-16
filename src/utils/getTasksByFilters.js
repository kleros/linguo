import { statusFilters } from '~/consts/statusFilters';
import Task from '~/utils/task/index';
import taskStatus from '~/consts/taskStatus';

export const USER_TYPE = Object.freeze({
  requester: 'requester',
  translator: 'translator',
});

export const getTasksByFilters = (tasks, { account, userType, filters }) => {
  const { status, allTasks } = filters;

  const filteredTasks = tasks.filter(task => {
    if (!filterToTaskStatusMap[status](task)) return false;
    if (!allTasks && account && task[userType] !== account) return false;
    return true;
  });

  return filteredTasks;
};

const filterToTaskStatusMap = {
  [statusFilters.all]: () => true,
  [statusFilters.open]: ({ status, translation, lastInteraction, submissionTimeout }) =>
    Task.isOpen(status, translation, lastInteraction, submissionTimeout),
  [statusFilters.inProgress]: ({ status, translation, lastInteraction, submissionTimeout }) =>
    Task.isInProgress(status, translation, lastInteraction, submissionTimeout),
  [statusFilters.inReview]: ({ status }) => status === taskStatus.AwaitingReview,
  [statusFilters.inDispute]: ({ status }) => status === taskStatus.DisputeCreated,
  [statusFilters.finished]: ({ status, translation, lastInteraction, submissionTimeout }) =>
    Task.isCompleted(status, translation, lastInteraction, submissionTimeout),
  [statusFilters.incomplete]: ({ status, translation, lastInteraction, submissionTimeout }) =>
    Task.isIncomplete(status, translation, lastInteraction, submissionTimeout),
};
