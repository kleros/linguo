import React from 'react';
import { TaskParty, DisputeRuling } from '~/app/linguo';
import TranslationApprovedAvatar from '~/assets/images/avatar-translation-approved.svg';
import TranslationRejectedAvatar from '~/assets/images/avatar-translation-rejected.svg';
import RefusedToRuleAvatar from '~/assets/images/avatar-refused-to-rule.svg';
import useTask from '../../../useTask';
import useCurrentParty from '../../hooks/useCurrentParty';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import DisputeContext from './DisputeContext';

function DisputeAppealPeriodIsOver() {
  const { ruling } = React.useContext(DisputeContext);
  const { requester, parties } = useTask();
  const party = useCurrentParty();

  const challengerIsRequester = requester === parties[TaskParty.Challenger];

  const title = titleMap[ruling];
  const description = getDescription({ party, ruling, challengerIsRequester });
  const illustration = illustrationMap[ruling];

  return <TaskStatusDetailsLayout title={title} description={description} illustration={illustration} />;
}

export default DisputeAppealPeriodIsOver;

const titleMap = {
  [DisputeRuling.RefuseToRule]: 'Appeal period is over: the jurors refused to arbitrate',
  [DisputeRuling.TranslationApproved]: 'Appeal period is over: the translation was accepted',
  [DisputeRuling.TranslationRejected]: 'Appeal period is over: the translation was rejected',
};

const getDescription = ({ party, ruling, challengerIsRequester }) => {
  const descriptionMap = {
    [TaskParty.Requester]: {
      [DisputeRuling.RefuseToRule]: ['You will receive the escrow payment back.'],
      [DisputeRuling.TranslationApproved]: ['The escrow payment will go to the translator.'],
      [DisputeRuling.TranslationRejected]: ['You will receive the escrow payment back.'],
    },
    [TaskParty.Translator]: {
      [DisputeRuling.RefuseToRule]: ['You will receive the escrow payment back (minus arbitration fees).'],
      [DisputeRuling.TranslationApproved]: [
        'You will receive your deposit back + the escrow payment (minus arbitration fees).',
      ],
      [DisputeRuling.TranslationRejected]: ['Your deposit will be sent to the requester.'],
    },
    [TaskParty.Challenger]: {
      [DisputeRuling.RefuseToRule]: challengerIsRequester
        ? ['You will receive the escrow payment + your challenge deposit back (minus arbitration fees).']
        : ['You will receive your challenge deposit back (minus arbitration fees).'],
      [DisputeRuling.TranslationApproved]: challengerIsRequester
        ? ['Your escrow payment + your challenge deposit will be sent to the translator.']
        : ['Your challenge deposit will be sent to the translator.'],
      [DisputeRuling.TranslationRejected]: [
        challengerIsRequester
          ? 'You will receive your escrow payment + your challenge deposit back + the translator deposit (minus arbitration fees).'
          : 'Your will receive your challenge deposit back + the translator deposit (minus arbitration fees).',
      ],
    },
  };

  return descriptionMap[party][ruling];
};

const illustrationMap = {
  [DisputeRuling.RefuseToRule]: <RefusedToRuleAvatar />,
  [DisputeRuling.TranslationApproved]: <TranslationApprovedAvatar />,
  [DisputeRuling.TranslationRejected]: <TranslationRejectedAvatar />,
};
