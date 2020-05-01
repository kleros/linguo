import React from 'react';
import VerticalSplitLayout from '../../layout/VerticalSplit';
import TaskInDisputeAvatar from '~/assets/images/avatar-task-in-dispute.svg';

function DisputeCreatedForTranslator() {
  const props = {
    title: 'The translation is being evaluated by the jurors',
    description: [
      `Specialized jurors are evaluating the case.
       You will be informed about their decision soon.`,
      `If the translation is approved by the jurors, you will receive the
       escrow deposit + your translation deposit back + the challenger's deposit
       (minus arbitration fees).`,
      `Otherwise, if the jurors decide to not approve the translation,
       the escrow deposit goes back to the task requester
       and your deposit goes to the challenger.`,
    ],
    illustration: <TaskInDisputeAvatar />,
  };

  return <VerticalSplitLayout {...props} />;
}

export default DisputeCreatedForTranslator;
