import React from 'react';
import { TaskParty, DisputeRuling } from '~/app/linguo';
import TranslationApprovedAvatar from '~/assets/images/avatar-translation-approved.svg';
import TranslationRejectedAvatar from '~/assets/images/avatar-translation-rejected.svg';
import RefusedToRuleAvatar from '~/assets/images/avatar-refused-to-rule.svg';
import useTask from '../../../useTask';
import useCurrentParty from '../../hooks/useCurrentParty';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';

function Resolved() {
  const { hasDispute, ruling, requester, parties } = useTask();
  const party = useCurrentParty();

  const challengerIsRequester = requester === parties[TaskParty.Challenger];

  const title = titleMap[hasDispute][ruling];
  const description = getDescription({ party, hasDispute, ruling, challengerIsRequester });
  const illustration = illustrationMap[ruling];

  return <TaskStatusDetailsLayout title={title} description={description} illustration={illustration} />;
}

export default Resolved;

const titleMap = {
  false: {
    [DisputeRuling.RefuseToRule]: 'The translation was not accepted neither rejected',
    [DisputeRuling.TranslationApproved]: 'The translation was approved',
    [DisputeRuling.TranslationRejected]: 'The translation was rejected',
  },
  true: {
    [DisputeRuling.RefuseToRule]: 'Final decision: the jurors refused to arbitrate the case',
    [DisputeRuling.TranslationApproved]: 'Final decision: the jurors approved the translation',
    [DisputeRuling.TranslationRejected]: 'Final decision: the jurors rejected the translation',
  },
};

const getDescription = ({ party, hasDispute, ruling, challengerIsRequester }) => {
  const descriptionMap = {
    [TaskParty.Requester]: {
      false: {
        [DisputeRuling.RefuseToRule]: ['You received the escrow payment back.'],
        [DisputeRuling.TranslationApproved]: ['The escrow payment goes to the translator.'],
        [DisputeRuling.TranslationRejected]: ['You received the escrow payment back.'],
      },
      true: {
        [DisputeRuling.RefuseToRule]: ['You received the escrow payment back.'],
        [DisputeRuling.TranslationApproved]: ['The escrow payment goes to the translator.'],
        [DisputeRuling.TranslationRejected]: ['You received the escrow payment back.'],
      },
    },
    [TaskParty.Translator]: {
      false: {
        [DisputeRuling.RefuseToRule]: ['You received your deposit back.'],
        [DisputeRuling.TranslationApproved]: ['You received your deposit back + the escrow payment.'],
        [DisputeRuling.TranslationRejected]: ['Your deposit was sent to the requester.'],
      },
      true: {
        [DisputeRuling.RefuseToRule]: ['You received the escrow payment back (minus arbitration fees).'],
        [DisputeRuling.TranslationApproved]: [
          'You received your deposit back + the escrow payment (minus arbitration fees).',
        ],
        [DisputeRuling.TranslationRejected]: ['Your deposit was sent to the requester.'],
      },
    },
    [TaskParty.Challenger]: {
      true: {
        [DisputeRuling.RefuseToRule]: challengerIsRequester
          ? ['You received the escrow payment + your challenge deposit back (minus arbitration fees).']
          : ['You received your challenge deposit back (minus arbitration fees).'],
        [DisputeRuling.TranslationApproved]: challengerIsRequester
          ? ['Your escrow payment + your challenge deposit were sent to the translator.']
          : ['Your challenge deposit was sent to the translator.'],
        [DisputeRuling.TranslationRejected]: [
          challengerIsRequester
            ? 'You received your escrow payment + your challenge deposit back + the translator deposit (minus arbitration fees).'
            : 'You received your challenge deposit back + the translator deposit (minus arbitration fees).',
        ],
      },
    },
  };

  return descriptionMap[party]?.[hasDispute]?.[ruling] ?? [];
};

const illustrationMap = {
  [DisputeRuling.RefuseToRule]: <RefusedToRuleAvatar />,
  [DisputeRuling.TranslationApproved]: <TranslationApprovedAvatar />,
  [DisputeRuling.TranslationRejected]: <TranslationRejectedAvatar />,
};
