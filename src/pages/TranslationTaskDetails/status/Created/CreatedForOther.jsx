import React from 'react';
import Spacer from '~/components/Spacer';
import VerticalSplitLayout from '../layout/VerticalSplit';
import TaskInteractionButton from '../components/TaskInteractionButton';
import TaskDeadline from '../components/TaskDeadline';
import TaskAssignmentDepositFetcher from '../components/TaskAssignmentDepositFetcher';

function CreatedForOther() {
  const props = {
    title: 'Start translating it',
    description: [
      'In order to self-assign this task you need to send a translation deposit. The value will be reimbursed when the task is finished and approved after the review time.',
      'In case your translation is not delivered in time or not approved, it will be used as a compensation to the task requester or challenger.',
    ],
    interaction: (
      <>
        <TaskDeadline />
        <Spacer />
        <TaskInteractionButton
          interaction={TaskInteractionButton.Interaction.Assign}
          content={{ idle: 'Translate It' }}
          buttonProps={{ fullWidth: true }}
        />
        <Spacer />
        <TaskAssignmentDepositFetcher />
      </>
    ),
  };

  return <VerticalSplitLayout {...props} />;
}

export default CreatedForOther;
