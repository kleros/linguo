import React from 'react';
import Spacer from '~/shared/Spacer';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import ContextAwareTaskInteractionButton from '../../components/ContextAwareTaskInteractionButton';
import TaskDeadline from '../../components/TaskDeadline';
import TaskIgnoredAvatar from '~/assets/images/avatar-task-incomplete.svg';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';

import taskStatus from '~/consts/taskStatus';

function IncompleteForRequester() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const isAssigned = task.status === taskStatus.Assigned;

  const title = 'This translation was not completed on time';

  const props = task.isPending
    ? {
        title,
        description: isAssigned
          ? [
              'We will send you the the bounty back + the Translator Deposit in a few moments.',
              'If you prefer not to wait, you can claim the deposits now.',
            ]
          : [
              'You will have the bounty reimbursed in a few moments.',
              'If you prefer not to wait, you can claim it back now.',
            ],
        interaction: (
          <>
            <TaskDeadline />
            <Spacer />
            <ContextAwareTaskInteractionButton
              interaction={ContextAwareTaskInteractionButton.Interaction.Reimburse}
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
