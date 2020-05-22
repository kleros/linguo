import React from 'react';
import { Task, TaskStatus } from '~/app/linguo';
import Spacer from '~/components/Spacer';
import TaskContext from '../../../TaskContext';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import TaskInteractionButton from '../../components/TaskInteractionButton';
import TaskDeadline from '../../components/TaskDeadline';
import TaskIgnoredAvatar from '~/assets/images/avatar-task-incomplete.svg';

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
              'We will send you the translator deposit + your deposit back in a few moments.',
              'If you prefer not to wait, you can claim the deposits now.',
            ]
          : [
              'You will be automatically reimbursed in a few moments.',
              'If you prefer not to wait, you can claim you deposit back now.',
            ],
        interaction: (
          <>
            <TaskDeadline />
            <Spacer />
            <TaskInteractionButton
              interaction={TaskInteractionButton.Interaction.Reimburse}
              content={{
                idle: { text: isAssigned ? 'Claim Deposit' : 'Reimburse Me' },
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
