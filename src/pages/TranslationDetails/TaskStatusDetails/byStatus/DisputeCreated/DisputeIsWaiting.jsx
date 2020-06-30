import React from 'react';
import { TaskParty } from '~/app/linguo';
import TaskInDisputeAvatar from '~/assets/images/avatar-task-in-dispute.svg';
import useTask from '../../../useTask';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import useCurrentParty from '../../hooks/useCurrentParty';

function DisputeIsWaiting() {
  const party = useCurrentParty();

  const { requester, parties } = useTask();
  const challengerIsRequester = requester === parties?.[TaskParty.Challenger];

  const props = contentByParty[party]({ challengerIsRequester });

  return <TaskStatusDetailsLayout {...props} />;
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
            'If the translation is not approved by the jurors, you receive the escrow payment back + your challenge deposit + the deposit of the translator (minus arbitration fees).',
            'Otherwise, if the jurors decide to approve the translation, the escrow payment + your challenge deposit goes to the translator.',
          ],
        }
      : {
          title,
          illustration,
          description: [
            'Specialized jurors are evaluating the case.  You will be informed about their decision soon.',
            'If the translation is not approved by the jurors, the requester will receive his escrow payment back. You will receive your challenge deposit back + the deposit of the translator (minus arbitration fees).',
            'Otherwise, if the jurors decide to approve the translation, the escrow payment + your challenge deposit goes to the translator.',
          ],
        },
  [TaskParty.Requester]: () => ({
    title,
    illustration,
    description: [
      'Specialized jurors are evaluating the case. You will be informed about their decision soon.',
      'If the translation is not approved by the jurors, you receive the escrow payment back.',
      'Otherwise, if the jurors decide to not approve the translation the escrow payment goes to the translator.',
    ],
  }),
  [TaskParty.Translator]: () => ({
    title,
    illustration,
    description: [
      'Specialized jurors are evaluating the case. You will be informed about their decision soon.',
      'If the translation is approved by the jurors, you receive the escrow payment + your translation deposit back + the challenger’s deposit (minus arbitration fees).',
      'Otherwise, if the jurors decide to not approve the translation the escrow payment goes back to the task requester and your deposit goes to the challenger.',
    ],
  }),
  [TaskParty.Requester]: () => ({
    title,
    illustration,
    description: [
      'Specialized jurors are evaluating the case. You will be informed about their decision soon.',
      'If the translation is not approved by the jurors, you receive the escrow payment back.',
      'Otherwise, if the jurors decide to not approve the translation the escrow payment goes to the translator.',
    ],
  }),
  [TaskParty.Other]: () => ({
    title,
    illustration,
    description: [
      'Specialized jurors are evaluating the case.',
      'If the translation is not approved by the jurors, the requester will receive his escrow payment back and the challenger will receive the challenge deposit back + the deposit of the translator (minus arbitration fees).',
      'Otherwise, if the jurors decide to not approve the translation, the translator will receive the translation deposit back + the escrow payment + the deposit of the challenger (minus arbitration fees).',
    ],
  }),
};
