import React from 'react';
import { Task, TaskStatus } from '~/app/linguo';
import TaskIgnoredAvatar from '~/assets/images/avatar-task-incomplete.svg';
import Spacer from '~/components/Spacer';
import TaskContext from '../../../TaskContext';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import TaskInteractionButton from '../../components/TaskInteractionButton';
import TaskDeadline from '../../components/TaskDeadline';

function IncompleteForRequester() {
  const task = React.useContext(TaskContext);
  const isPending = Task.isPending(task);
  const isAssigned = task.status === TaskStatus.Assigned;

  const title = 'This translation was not completed on time';

  const props = isPending
    ? {
        title,
        description: isAssigned
          ? [
              `We will send the translator deposit + the requester deposit back
               to the requester's address in a few moments.`,
              'You can help speed up this proccess if you like.',
            ]
          : [
              'The requester will be automatically reimbursed in a few moments.',
              'You can help speed up this proccess if you like.',
            ],
        interaction: (
          <>
            <TaskDeadline />
            <Spacer />
            <TaskInteractionButton
              interaction={TaskInteractionButton.Interaction.Reimburse}
              content={{
                idle: { text: isAssigned ? 'Send Deposit' : 'Reimburse Requester' },
              }}
              buttonProps={{ fullWidth: true }}
            />
          </>
        ),
      }
    : {
        title,
        description: [
          'You can try submitting the same task again.',
          'Increasing the payout might help you get it done on time.',
        ],
        illustration: <TaskIgnoredAvatar />,
      };

  return <TaskStatusDetailsLayout {...props} />;
}

export default IncompleteForRequester;
