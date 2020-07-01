import { TaskStatus } from '~/features/tasks';
import Incomplete from './Incomplete';
import Created from './Created';
import Assigned from './Assigned';
import AwaitingReview from './AwaitingReview';
import DisputeCreated from './DisputeCreated';
import Resolved from './Resolved';

export default {
  Incomplete,
  [TaskStatus.Created]: Created,
  [TaskStatus.Assigned]: Assigned,
  [TaskStatus.AwaitingReview]: AwaitingReview,
  [TaskStatus.DisputeCreated]: DisputeCreated,
  [TaskStatus.Resolved]: Resolved,
};
