import React from 'react';
import styled from 'styled-components';
import RefusedToRuleAvatar from '~/assets/images/avatar-refused-to-rule.svg';
import TranslationApprovedAvatar from '~/assets/images/avatar-translation-approved.svg';
import TranslationRejectedAvatar from '~/assets/images/avatar-translation-rejected.svg';
import TaskResolvedAvatar from '~/assets/images/avatar-task-resolved.svg';
import { TaskParty } from '~/features/tasks';
import DisputeLink from '~/shared/DisputeLink';
import EthValue from '~/shared/EthValue';
import Spacer from '~/shared/Spacer';
import ContextAwareTaskInteractionButton from '../../components/ContextAwareTaskInteractionButton';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import useCurrentParty from '../../hooks/useCurrentParty';
import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import { useLinguo } from '~/hooks/useLinguo';
import disputeRuling from '~/consts/disputeRuling';
import resolutionReason from '~/consts/resolutionReason';

export default function Resolved() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);
  const { challenger, disputed, disputeID, finalRuling, reason, requester } = task;
  const party = useCurrentParty();
  const challengerIsRequester = requester === challenger;

  const title = titleMap[disputed][disputed ? finalRuling : reason];
  const description = disputed
    ? [
        <DisputeLink key="kleros-dispute-link" disputeID={Number(disputeID)} />,
        ...getDescription(party, disputed, disputed ? finalRuling : reason, challengerIsRequester),
      ]
    : getDescription(party, disputed, disputed ? finalRuling : reason, challengerIsRequester);

  const pendingWithdrawal = usePendingWithdrawal();

  const props = pendingWithdrawal
    ? {
        interaction: pendingWithdrawal,
      }
    : {
        illustration: getIllustration({ disputed, finalRuling }),
      };

  return <TaskStatusDetailsLayout title={title} description={description} {...props} />;
}

function usePendingWithdrawal() {
  const { account, chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);
  const linguo = useLinguo();

  // const withdrawableAmountt = linguo.call('amountWithdrawable', task.taskID, account);
  const [withdrawableAmount, setWithdrawableAmount] = React.useState(
    linguo.call('amountWithdrawable', task.taskID, account)
  );
  const registerWithdrawal = React.useCallback(() => {
    setWithdrawableAmount('0');
  }, []);

  /* React.useEffect(() => {
    setWithdrawableAmount(linguo.call('amountWithdrawable', task.taskID, account));
  }, [account, linguo, task.taskID]); */
  return withdrawableAmount === 0 ? null : (
    <>
      <ContextAwareTaskInteractionButton
        onSuccess={registerWithdrawal}
        interaction={ContextAwareTaskInteractionButton.Interaction.Withdraw}
        buttonProps={{
          fullWidth: true,
        }}
        content={{
          idle: {
            icon: null,
            text: (
              <EthValue
                amount={withdrawableAmount}
                suffixType="short"
                render={({ formattedValue, suffix }) => `Withdraw ${formattedValue} ${suffix}`}
              />
            ),
          },
        }}
      />
      <Spacer baseSize="sm" />
      <StyledExplainer>Contributed Fees + Rewards</StyledExplainer>
    </>
  );
}

const titleMap = {
  false: {
    [resolutionReason.Accepted]: 'The translation was approved',
    [resolutionReason.Reimbursed]: 'The requester was reibmursed',
  },
  true: {
    [disputeRuling.RefuseToRule]: 'Final decision: the jurors refused to arbitrate the case',
    [disputeRuling.TranslationApproved]: 'Final decision: translation approved',
    [disputeRuling.TranslationRejected]: 'Final decision: translation rejected',
  },
};

const getDescription = (party, disputed, ruling, challengerIsRequester) => {
  const descriptionMap = {
    [TaskParty.Requester]: {
      false: {
        [resolutionReason.Accepted]: ['The bounty goes to the translator.'],
        [resolutionReason.Reimbursed]: [
          'You received the bounty back and also the deposit of the translator, if there was one.',
        ],
      },
      true: {
        [disputeRuling.RefuseToRule]: ['You received the bounty back.'],
        [disputeRuling.TranslationApproved]: ['The bounty goes to the translator.'],
        [disputeRuling.TranslationRejected]: ['You received the bounty back.'],
      },
    },
    [TaskParty.Translator]: {
      false: {
        [resolutionReason.Accepted]: ['You received your Translator Deposit back + the bounty.'],
        [resolutionReason.Reimbursed]: [
          'The requester received your Translator Deposit because you failed to submit the translation before the deadline.',
        ],
      },
      true: {
        [disputeRuling.RefuseToRule]: ['You received the bounty back - Arbitration Fees.'],
        [disputeRuling.TranslationApproved]: [
          'You received your Translator Deposit back + the bounty - Arbitration Fees.',
        ],
        [disputeRuling.TranslationRejected]: ['Your Translator Deposit was sent to the challenger.'],
      },
    },
    [TaskParty.Challenger]: {
      true: {
        [disputeRuling.RefuseToRule]: challengerIsRequester
          ? ['You received the bounty + your Challenger Deposit back - Arbitration Fees.']
          : ['You received your Challenger Deposit back - Arbitration Fees.'],
        [disputeRuling.TranslationApproved]: challengerIsRequester
          ? ['The bounty + your Challenger Deposit were sent to the translator.']
          : ['Your Challenger Deposit was sent to the translator.'],
        [disputeRuling.TranslationRejected]: [
          challengerIsRequester
            ? 'You received the bounty + your Challenger Deposit back + the Translator Deposit - Arbitration Fees.'
            : 'You received your Challenger Deposit back + the Translator Deposit - Arbitration Fees.',
        ],
      },
    },
    [TaskParty.Other]: {
      false: {
        [resolutionReason.Accepted]: ['The bounty goes to the translator.'],
        [resolutionReason.Reimbursed]: [
          'The requester recieves the Requester Deposit back.',
          'The Translator Deposit goes to the requester, if there was one',
        ],
      },
      true: {
        [disputeRuling.RefuseToRule]: [
          'The requester received the bounty back.',
          'The translator received the Translator Deposit back.',
        ],
        [disputeRuling.TranslationApproved]: [
          'The value of the bounty + the Challenger Deposit - Arbitration Fees goes to the translator.',
        ],
        [disputeRuling.TranslationRejected]: [
          'The requester received the bounty back.',
          'The value of the Translator Deposit - Arbitration Fees goes to the challenger.',
        ],
      },
    },
  };

  return descriptionMap[party]?.[disputed]?.[ruling] ?? [];
};

const illustrationMap = {
  [disputeRuling.RefuseToRule]: <RefusedToRuleAvatar />,
  [disputeRuling.TranslationApproved]: <TranslationApprovedAvatar />,
  [disputeRuling.TranslationRejected]: <TranslationRejectedAvatar />,
  noDispute: <TaskResolvedAvatar />,
};

const getIllustration = ({ disputed, finalRuling }) =>
  disputed ? illustrationMap[finalRuling] : illustrationMap.noDispute;

const StyledExplainer = styled.small`
  color: ${p => p.theme.color.text.light};
  font-size: ${p => p.theme.fontSize.sm};
`;
