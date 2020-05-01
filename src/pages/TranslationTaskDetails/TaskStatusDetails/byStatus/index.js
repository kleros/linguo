import { TaskStatus } from '~/app/linguo';
import Incomplete from './Incomplete';
import Created from './Created';
import Assigned from './Assigned';
import AwaitingReview from './AwaitingReview';

export default {
  Incomplete,
  [TaskStatus.Created]: Created,
  [TaskStatus.Assigned]: Assigned,
  [TaskStatus.AwaitingReview]: AwaitingReview,
};
