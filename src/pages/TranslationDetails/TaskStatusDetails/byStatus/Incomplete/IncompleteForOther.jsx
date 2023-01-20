import React from 'react';
import TaskIgnoredAvatar from '~/assets/images/avatar-task-incomplete.svg';
import Spacer from '~/shared/Spacer';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import ContextAwareTaskInteractionButton from '../../components/ContextAwareTaskInteractionButton';
import TaskDeadline from '../../components/TaskDeadline';
import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import Task from '~/utils/task';
import taskStatus from '~/consts/taskStatus';
import { useTask } from '~/hooks/useTask';

function IncompleteForRequester() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const isPending = Task.isPending(task.status);
  const isAssigned = task.status === taskStatus.Assigned;

  const title = 'This translation was not completed on time';

  const props = isPending
    ? {
        title,
        description: isAssigned
          ? [
              'We will send the Translator Deposit + the bounty back to the requester in a few moments.',
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
            <ContextAwareTaskInteractionButton
              interaction={ContextAwareTaskInteractionButton.Interaction.Reimburse}
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
        description: isAssigned
          ? ['The requester received the bounty back + the Translator Deposit.']
          : ['The requester was reimbursed of the bounty.'],
        illustration: <TaskIgnoredAvatar />,
      };

  return <TaskStatusDetailsLayout {...props} />;
}

export default IncompleteForRequester;
