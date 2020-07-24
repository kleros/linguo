import React from 'react';
import Spacer from '~/shared/Spacer';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import TaskInteractionButton from '../../components/TaskInteractionButton';
import TaskDeadline from '../../components/TaskDeadline';
import TaskAssignmentDepositFetcher from '../../components/TaskAssignmentDepositFetcher';

function CreatedForOther() {
  const props = {
    title: 'Translate this text',
    description: [
      'In order to self-assign this task you need to send a Translator Deposit. The value will be reimbursed when the task is finished and approved after the review time.',
      'In case your translation is not delivered in time or not approved, it will be used as a compensation to the task requester or challenger.',
    ],
    interaction: (
      <>
        <TaskDeadline />
        <Spacer />
        <TaskInteractionButton
          interaction={TaskInteractionButton.Interaction.Assign}
          content={{
            idle: { text: 'Translate It' },
          }}
          buttonProps={{ fullWidth: true }}
        />
        <Spacer size={0.5} />
        <TaskAssignmentDepositFetcher />
      </>
    ),
  };

  return <TaskStatusDetailsLayout {...props} />;
}

export default CreatedForOther;
