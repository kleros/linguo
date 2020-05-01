import React from 'react';
import VerticalSplitLayout from '../../layout/VerticalSplit';
import TaskInDisputeAvatar from '~/assets/images/avatar-task-in-dispute.svg';

function DisputeCreatedForOther() {
  const props = {
    title: 'The translation is being evaluated by the jurors',
    description: [
      `Specialized jurors are evaluating the case.`,
      `If the translation is not approved by the jurors, the task requester will receive
       his escrow deposit back. The challenger will receive his deposit
       + the translator's deposit (minus arbitration fees).`,
      `Otherwise, if the jurors decide to approve the translation,
       the escrow deposit + the challenger's deposit (minus arbitration fees)
       goes to the translator.`,
    ],
    illustration: <TaskInDisputeAvatar />,
  };

  return <VerticalSplitLayout {...props} />;
}

export default DisputeCreatedForOther;
