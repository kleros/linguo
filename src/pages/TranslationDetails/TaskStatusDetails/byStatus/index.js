import Incomplete from './Incomplete';
import Created from './Created';
import Assigned from './Assigned';
import AwaitingReview from './AwaitingReview';
import DisputeCreated from './DisputeCreated';
import Resolved from './Resolved';
import taskStatus from '~/consts/taskStatus';

export default {
  Incomplete,
  [taskStatus.Created]: Created,
  [taskStatus.Assigned]: Assigned,
  [taskStatus.AwaitingReview]: AwaitingReview,
  [taskStatus.DisputeCreated]: DisputeCreated,
  [taskStatus.Resolved]: Resolved,
};
