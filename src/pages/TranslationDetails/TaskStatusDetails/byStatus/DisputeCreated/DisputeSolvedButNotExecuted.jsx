import React from 'react';
import { TaskParty } from '~/features/tasks';
import TranslationApprovedAvatar from '~/assets/images/avatar-translation-approved.svg';
import TranslationRejectedAvatar from '~/assets/images/avatar-translation-rejected.svg';
import RefusedToRuleAvatar from '~/assets/images/avatar-refused-to-rule.svg';
import DisputeLink from '~/shared/DisputeLink';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';

import { useTask } from '~/hooks/useTask';
import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import useCurrentParty from '~/hooks/useCurrentParty';
import disputeRuling from '~/consts/disputeRuling';

function DisputeSolvedButNotExecuted() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const { disputeID, challenger, requester, finalRuling } = task;
  const party = useCurrentParty();

  const challengerIsRequester = requester === challenger;

  const title = titleMap[finalRuling];
  const description = [
    <DisputeLink key="kleros-dispute-link" disputeID={disputeID} />,
    ...getDescription({ party, finalRuling, challengerIsRequester }),
  ];
  const illustration = illustrationMap[finalRuling];

  return <TaskStatusDetailsLayout title={title} description={description} illustration={illustration} />;
}

export default DisputeSolvedButNotExecuted;

const titleMap = {
  [disputeRuling.RefuseToRule]: 'Appeal period is over: the jurors refused to arbitrate',
  [disputeRuling.TranslationApproved]: 'Appeal period is over: the translation was accepted',
  [disputeRuling.TranslationRejected]: 'Appeal period is over: the translation was rejected',
};

const getDescription = ({ party, ruling, challengerIsRequester }) => {
  const descriptionMap = {
    [TaskParty.Requester]: {
      [disputeRuling.RefuseToRule]: ['You will receive the bounty back.'],
      [disputeRuling.TranslationApproved]: ['The bounty will go to the translator.'],
      [disputeRuling.TranslationRejected]: [
        'You will receive the bounty back + the Translator Deposit - Arbitration Fees.',
      ],
    },
    [TaskParty.Translator]: {
      [disputeRuling.RefuseToRule]: ['You will receive the bounty back - Arbitration Fees.'],
      [disputeRuling.TranslationApproved]: [
        'You will receive your Translator Deposit back + the bounty - Arbitration Fees.',
      ],
      [disputeRuling.TranslationRejected]: ['Your Translator Deposit will be sent to the requester.'],
    },
    [TaskParty.Challenger]: {
      [disputeRuling.RefuseToRule]: challengerIsRequester
        ? ['You will receive the bounty + your Challenger Deposit back - Arbitration Fees.']
        : ['You will receive your Challenger Deposit back - Arbitration Fees.'],
      [disputeRuling.TranslationApproved]: challengerIsRequester
        ? ['The bounty + your Challenger Deposit will be sent to the translator.']
        : ['Your Challenger Deposit will be sent to the translator.'],
      [disputeRuling.TranslationRejected]: [
        challengerIsRequester
          ? 'You will receive the bounty + your Challenger Deposit back + the Translator Deposit - Arbitration Fees.'
          : 'Your will receive your Challenger Deposit back + the Translator Deposit - Arbitration Fees.',
      ],
    },
    [TaskParty.Other]: {
      [disputeRuling.RefuseToRule]: ['The requester will receive the bounty back.'],
      [disputeRuling.TranslationApproved]: ['The bounty will go to the translator.'],
      [disputeRuling.TranslationRejected]: [
        'The requester will receive the bounty back.',
        'The challenger will receive the Translator Deposit - Arbitration Fees.',
      ],
    },
  };

  return descriptionMap[party][ruling];
};

const illustrationMap = {
  [disputeRuling.RefuseToRule]: <RefusedToRuleAvatar />,
  [disputeRuling.TranslationApproved]: <TranslationApprovedAvatar />,
  [disputeRuling.TranslationRejected]: <TranslationRejectedAvatar />,
};
