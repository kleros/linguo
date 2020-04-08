import TaskStatus from './entities/TaskStatus';

const filterMap = {
  all: () => true,
  open: ({ status, aborted }) => !aborted && status === TaskStatus.Created,
  inProgress: ({ status }) => status === TaskStatus.Assigned,
  inReview: ({ status }) => status === TaskStatus.AwaitingReview,
  inDispute: ({ status }) => status === TaskStatus.DisputeCreated,
  finished: ({ status, aborted }) => !aborted && status === TaskStatus.Resolved,
  aborted: ({ aborted }) => !!aborted,
};

/**
 * This callback is displayed as a global member.
 * @callback TaskFilterPredicate
 * @param {object} task The task object.
 * @return {boolean} If the task should be included in the filter or not.
 */

/**
 * Get a filter predicate function based on a predefined name.
 *
 * @param {'all'|'open'|'inProgress'|'inReview'|'inDispute'|'finished'|'aborted'} name The name of the filter
 * @return TaskFilterPredicate a filter predicated function to be used with Array#filter.
 */
export default function getFilter(name) {
  const filter = filterMap[name];
  return filter || filterMap.all;
}
