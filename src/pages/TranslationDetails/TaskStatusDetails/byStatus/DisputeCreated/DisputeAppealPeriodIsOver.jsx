import React from 'react';
import { TaskParty } from '~/features/tasks';
import { DisputeRuling } from '~/features/disputes';
import TranslationApprovedAvatar from '~/assets/images/avatar-translation-approved.svg';
import TranslationRejectedAvatar from '~/assets/images/avatar-translation-rejected.svg';
import RefusedToRuleAvatar from '~/assets/images/avatar-refused-to-rule.svg';
import DisputeLink from '~/shared/DisputeLink';
import useTask from '../../../useTask';
import useCurrentParty from '../../hooks/useCurrentParty';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import DisputeContext from './DisputeContext';

function DisputeAppealPeriodIsOver() {
  const { ruling } = React.useContext(DisputeContext);
  const { requester, parties, disputeID } = useTask();
  const party = useCurrentParty();

  const challengerIsRequester = requester === parties[TaskParty.Challenger];

  const title = titleMap[ruling];
  const description = [
    <DisputeLink key="kleros-dispute-link" disputeID={disputeID} />,
    ...getDescription({ party, ruling, challengerIsRequester }),
  ];
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
      [DisputeRuling.RefuseToRule]: ['You will receive the Requester Deposit back.'],
      [DisputeRuling.TranslationApproved]: ['The Requester Deposit will go to the translator.'],
      [DisputeRuling.TranslationRejected]: [
        'You will receive the Requester Deposit back + the Translator Deposit - Arbitration Fees.',
      ],
    },
    [TaskParty.Translator]: {
      [DisputeRuling.RefuseToRule]: ['You will receive the Requester Deposit back - Arbitration Fees.'],
      [DisputeRuling.TranslationApproved]: [
        'You will receive your Translator Deposit back + the Requester Deposit - Arbitration Fees.',
      ],
      [DisputeRuling.TranslationRejected]: ['Your Translator Deposit will be sent to the requester.'],
    },
    [TaskParty.Challenger]: {
      [DisputeRuling.RefuseToRule]: challengerIsRequester
        ? ['You will receive the Requester Deposit + your Challenger Deposit back - Arbitration Fees.']
        : ['You will receive your Challenger Deposit back - Arbitration Fees.'],
      [DisputeRuling.TranslationApproved]: challengerIsRequester
        ? ['Your Requester Deposit + your Challenger Deposit will be sent to the translator.']
        : ['Your Challenger Deposit will be sent to the translator.'],
      [DisputeRuling.TranslationRejected]: [
        challengerIsRequester
          ? 'You will receive your Requester Deposit + your Challenger Deposit back + the Translator Deposit - Arbitration Fees.'
          : 'Your will receive your Challenger Deposit back + the Translator Deposit - Arbitration Fees.',
      ],
    },
    [TaskParty.Other]: {
      [DisputeRuling.RefuseToRule]: ['The requester will receive the Requester Deposit back.'],
      [DisputeRuling.TranslationApproved]: ['The Requester Deposit will go to the translator.'],
      [DisputeRuling.TranslationRejected]: [
        'The requester will receive the Requester Deposit back.',
        'The challenger will receive the Translator Deposit - Arbitration Fees.',
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
