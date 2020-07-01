import { Enum } from '~/features/shared/entities/utils';

/**
 * Task Status as represented in the smart contract.
 *
 * @readonly
 * @enum {number}
 */
const TaskStatus = Enum(
  'TaskStatus',
  {
    Created: 0,
    Assigned: 1,
    AwaitingReview: 2,
    DisputeCreated: 3,
    Resolved: 4,
  },
  { parseValue: v => Number.parseInt(v, 10) }
);

export default TaskStatus;
