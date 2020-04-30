/**
 * Task Status as represented in the smart contract.
 *
 * @readonly
 * @enum {number}
 */
const TaskStatus = {
  Created: 0,
  Assigned: 1,
  AwaitingReview: 2,
  DisputeCreated: 3,
  Resolved: 4,
};

export { TaskStatus as default };
