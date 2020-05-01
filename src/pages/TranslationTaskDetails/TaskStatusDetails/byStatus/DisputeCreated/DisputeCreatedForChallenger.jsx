import React from 'react';
import TaskContext from '../../../TaskContext';
import VerticalSplitLayout from '../../layout/VerticalSplit';
import TaskInDisputeAvatar from '~/assets/images/avatar-task-in-dispute.svg';

function DisputeCreatedForChallenger() {
  const { requester, parties, dispute } = React.useContext(TaskContext);
  console.log({ dispute });

  const challengerIsRequester = requester === parties?.challenger;

  const title = 'The translation is being evaluated by the jurors';
  const illustration = <TaskInDisputeAvatar />;

  const props = challengerIsRequester
    ? {
        title,
        illustration,
        description: [
          `Specialized jurors are evaluating the case.
           You will be informed about their decision soon.`,
          `If the translation is not approved by the jurors you receive the escrow payment back
           + your challenge deposit + the deposit of the translator (minus arbitration fees).`,
          `Otherwise, if the jurors decide to approve the translation, the escrow payment
           + your challenge deposit goes to the translator.`,
        ],
      }
    : {
        title,
        illustration,
        description: [
          `Specialized jurors are evaluating the case.
           You will be informed about their decision soon.`,
          `If the translation is not approved by the jurors, the requester will receive
           his escrow payment back. You will receive your challenge deposit back
           + the deposit of the translator (minus arbitration fees).`,
          `Otherwise, if the jurors decide to approve the translation, the escrow payment
           + your challenge deposit goes to the translator.`,
        ],
      };

  return <VerticalSplitLayout {...props} />;
}

export default DisputeCreatedForChallenger;
