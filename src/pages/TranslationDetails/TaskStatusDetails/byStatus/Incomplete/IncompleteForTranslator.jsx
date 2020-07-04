import React from 'react';
import { Task } from '~/features/tasks';
import TaskIgnoredAvatar from '~/assets/images/avatar-task-incomplete.svg';
import EthValue from '~/shared/EthValue';
import useTask from '../../../useTask';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';

function IncompleteForTranslator() {
  const task = useTask();
  const isPending = Task.isPending(task);

  /*
   * A task which is Incomplete was not challenged, so the value of sumDeposit
   * is exactly the value of the translator deposit.
   */
  const translatorDeposit = task.sumDeposit;

  const title = 'You did not complete this translation in time';
  const illustration = <TaskIgnoredAvatar />;

  const props = isPending
    ? {
        title,
        illustration,
        description: [
          <EthValue
            key="warning"
            amount={translatorDeposit}
            suffixType="short"
            render={({ formattedValue, suffix }) =>
              `As a compensation for the requester, the value you deposited when assigned
               to this task (${formattedValue} ${suffix}) will be sent to the requester's address.`
            }
          />,
        ],
      }
    : {
        title,
        illustration,
        description: [
          'You can try submitting the same task again.',
          'Increasing the payout might help you get it done on time.',
        ],
      };

  return <TaskStatusDetailsLayout {...props} />;
}

export default IncompleteForTranslator;
