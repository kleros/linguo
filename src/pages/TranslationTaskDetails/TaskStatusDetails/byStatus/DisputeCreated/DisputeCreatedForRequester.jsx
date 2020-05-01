import React from 'react';
import VerticalSplitLayout from '../../layout/VerticalSplit';
import TaskInDisputeAvatar from '~/assets/images/avatar-task-in-dispute.svg';

function DisputeCreatedForRequester() {
  const props = {
    title: 'The translation is being evaluated by the jurors',
    description: [
      `Specialized jurors are evaluating the case.
       You will be informed about their decision soon.`,
      `If the translation is not approved by the jurors, you will receive
       your escrow deposit back. The challenger will receive his deposit
       + the deposit of the translator (minus arbitration fees).`,
      `Otherwise, if the jurors decide to approve the translation,
       your escrow deposit goes to the translator.`,
    ],
    illustration: <TaskInDisputeAvatar />,
  };

  return <VerticalSplitLayout {...props} />;
}

export default DisputeCreatedForRequester;
