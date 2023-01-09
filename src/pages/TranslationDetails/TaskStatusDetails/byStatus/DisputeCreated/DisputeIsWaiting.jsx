import React from 'react';
import { TaskParty } from '~/features/tasks';
import TaskInDisputeAvatar from '~/assets/images/avatar-task-in-dispute.svg';
import DisputeLink from '~/shared/DisputeLink';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import useCurrentParty from '~/hooks/useCurrentParty';

function DisputeIsWaiting() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);
  const party = useCurrentParty();

  const { disputeID, challenger, requester } = task;
  const challengerIsRequester = requester === challenger;

  const { description, ...props } = contentByParty[party]({ challengerIsRequester });

  return (
    <TaskStatusDetailsLayout
      description={[<DisputeLink key="kleros-dispute-link" disputeID={disputeID} />, ...description]}
      {...props}
    />
  );
}

export default DisputeIsWaiting;
const title = 'The translation is being evaluated by the jurors';
const illustration = <TaskInDisputeAvatar />;

const contentByParty = {
  [TaskParty.Challenger]: ({ challengerIsRequester }) =>
    challengerIsRequester
      ? {
          title,
          illustration,
          description: [
            'Specialized jurors are evaluating the case. You will be informed about their decision soon.',
            'If the translation is not approved by the jurors, you receive the bounty back + your Challenger Deposit + Translator Deposit - Arbitration Fees.',
            'Otherwise, if the jurors decide to approve the translation, the value of the bounty + Challenger Deposit goes to the translator.',
          ],
        }
      : {
          title,
          illustration,
          description: [
            'Specialized jurors are evaluating the case.  You will be informed about their decision soon.',
            'If the translation is not approved by the jurors, the requester will receive his bounty back. You will receive your Challenger Deposit back + Translator Deposit - Arbitration Fees.',
            'Otherwise, if the jurors decide to approve the translation, the value of the bounty + your Challenger Deposit goes to the translator.',
          ],
        },
  [TaskParty.Requester]: () => ({
    title,
    illustration,
    description: [
      'Specialized jurors are evaluating the case. You will be informed about their decision soon.',
      'If the translation is not approved by the jurors, you receive the bounty back.',
      'Otherwise, if the jurors decide to not approve the translation the bounty goes to the translator.',
    ],
  }),
  [TaskParty.Translator]: () => ({
    title,
    illustration,
    description: [
      'Specialized jurors are evaluating the case. You will be informed about their decision soon.',
      'If the translation is approved by the jurors, you receive the bounty + your Translator Deposit back + the Chalenger Deposit - Arbitration Fees.',
      'Otherwise, if the jurors decide to not approve the translation, the bounty goes back to the task requester and your Translator Deposit goes to the challenger.',
    ],
  }),
  [TaskParty.Requester]: () => ({
    title,
    illustration,
    description: [
      'Specialized jurors are evaluating the case. You will be informed about their decision soon.',
      'If the translation is not approved by the jurors, you receive the bounty back.',
      'Otherwise, if the jurors decide to not approve the translation the bounty goes to the translator.',
    ],
  }),
  [TaskParty.Other]: () => ({
    title,
    illustration,
    description: [
      'Specialized jurors are evaluating the case.',
      'If the translation is not approved by the jurors, the requester will receive his bounty back and the challenger will receive the Challenger Deposit back + the Translator Deposit - Arbitration Fees.',
      'Otherwise, if the jurors decide to not approve the translation, the translator will receive the Translator Deposit back + the bounty + the Challenger Deposit - Arbitration Fees.',
    ],
  }),
};
