import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import RefusedToRuleAvatar from '~/assets/images/avatar-refused-to-rule.svg';
import TranslationApprovedAvatar from '~/assets/images/avatar-translation-approved.svg';
import TranslationRejectedAvatar from '~/assets/images/avatar-translation-rejected.svg';
import TaskResolvedAvatar from '~/assets/images/avatar-task-resolved.svg';
import { DisputeRuling } from '~/features/disputes';
import { TaskParty } from '~/features/tasks';
import { getWithdrawableAmount } from '~/features/tasks/tasksSlice';
import { selectAccount } from '~/features/web3/web3Slice';
import DisputeLink from '~/shared/DisputeLink';
import EthValue from '~/shared/EthValue';
import Spacer from '~/shared/Spacer';
import useTask from '../../../useTask';
import ContextAwareTaskInteractionButton from '../../components/ContextAwareTaskInteractionButton';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import useCurrentParty from '../../hooks/useCurrentParty';

export default function Resolved() {
  const { hasDispute, ruling, requester, parties, disputeID } = useTask();

  const party = useCurrentParty();

  const challengerIsRequester = requester === parties[TaskParty.Challenger];

  const title = titleMap[hasDispute][ruling];
  const description = hasDispute
    ? [
        <DisputeLink key="kleros-dispute-link" disputeID={disputeID} />,
        ...getDescription({ party, hasDispute, ruling, challengerIsRequester }),
      ]
    : getDescription({ party, hasDispute, ruling, challengerIsRequester });

  const pendingWithdrawal = usePendingWithdrawal();

  const props = pendingWithdrawal
    ? {
        interaction: pendingWithdrawal,
      }
    : {
        illustration: getIllustration({ hasDispute, ruling }),
      };

  return <TaskStatusDetailsLayout title={title} description={description} {...props} />;
}

function usePendingWithdrawal() {
  const dispatch = useDispatch();
  const { id } = useTask();
  const account = useSelector(selectAccount);

  const [withdrawableAmount, setWithdrawableAmount] = React.useState('0');
  const registerWithdrawal = React.useCallback(() => {
    setWithdrawableAmount('0');
  }, []);

  const doGetWithdrawableAmount = React.useCallback(async () => {
    try {
      const result = await dispatch(
        getWithdrawableAmount(
          { id, account },
          {
            meta: {
              thunk: { id },
            },
          }
        )
      );

      setWithdrawableAmount(result?.data ?? '0');
    } catch (err) {
      console.warn('Failed to get withdrawable amount', err);
    }
  }, [dispatch, id, account]);

  React.useEffect(() => {
    doGetWithdrawableAmount();
  }, [doGetWithdrawableAmount]);

  return withdrawableAmount === '0' ? null : (
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
    [DisputeRuling.RefuseToRule]: 'The translation was not accepted neither rejected',
    [DisputeRuling.TranslationApproved]: 'The translation was approved',
    [DisputeRuling.TranslationRejected]: 'The translation was rejected',
  },
  true: {
    [DisputeRuling.RefuseToRule]: 'Final decision: the jurors refused to arbitrate the case',
    [DisputeRuling.TranslationApproved]: 'Final decision: translation approved',
    [DisputeRuling.TranslationRejected]: 'Final decision: translation rejected',
  },
};

const getDescription = ({ party, hasDispute, ruling, challengerIsRequester }) => {
  const descriptionMap = {
    [TaskParty.Requester]: {
      false: {
        [DisputeRuling.RefuseToRule]: ['You received the bounty back.'],
        [DisputeRuling.TranslationApproved]: ['The bounty goes to the translator.'],
        [DisputeRuling.TranslationRejected]: ['You received the bounty back.'],
      },
      true: {
        [DisputeRuling.RefuseToRule]: ['You received the bounty back.'],
        [DisputeRuling.TranslationApproved]: ['The bounty goes to the translator.'],
        [DisputeRuling.TranslationRejected]: ['You received the bounty back.'],
      },
    },
    [TaskParty.Translator]: {
      false: {
        [DisputeRuling.RefuseToRule]: ['You received your Translator Deposit back.'],
        [DisputeRuling.TranslationApproved]: ['You received your Translator Deposit back + the bounty.'],
        [DisputeRuling.TranslationRejected]: ['Your Translator Deposit was sent to the requester.'],
      },
      true: {
        [DisputeRuling.RefuseToRule]: ['You received the bounty back - Arbitration Fees.'],
        [DisputeRuling.TranslationApproved]: [
          'You received your Translator Deposit back + the bounty - Arbitration Fees.',
        ],
        [DisputeRuling.TranslationRejected]: ['Your Translator Deposit was sent to the challenger.'],
      },
    },
    [TaskParty.Challenger]: {
      true: {
        [DisputeRuling.RefuseToRule]: challengerIsRequester
          ? ['You received the bounty + your Challenger Deposit back - Arbitration Fees.']
          : ['You received your Challenger Deposit back - Arbitration Fees.'],
        [DisputeRuling.TranslationApproved]: challengerIsRequester
          ? ['The bounty + your Challenger Deposit were sent to the translator.']
          : ['Your Challenger Deposit was sent to the translator.'],
        [DisputeRuling.TranslationRejected]: [
          challengerIsRequester
            ? 'You received the bounty + your Challenger Deposit back + the Translator Deposit - Arbitration Fees.'
            : 'You received your Challenger Deposit back + the Translator Deposit - Arbitration Fees.',
        ],
      },
    },
    [TaskParty.Other]: {
      false: {
        [DisputeRuling.RefuseToRule]: [
          'The requester received the bounty back.',
          'The translator received the Translator Deposit back.',
        ],
        [DisputeRuling.TranslationApproved]: ['The bounty goes to the translator.'],
        [DisputeRuling.TranslationRejected]: ['The Translator Deposit goes to the challenger.'],
      },
      true: {
        [DisputeRuling.RefuseToRule]: [
          'The requester received the bounty back.',
          'The translator received the Translator Deposit back.',
        ],
        [DisputeRuling.TranslationApproved]: [
          'The value of the bounty + the Challenger Deposit - Arbitration Fees goes to the translator.',
        ],
        [DisputeRuling.TranslationRejected]: [
          'The requester received the bounty back.',
          'The value of the Translator Deposit - Arbitration Fees goes to the challenger.',
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
  noDispute: <TaskResolvedAvatar />,
};

const getIllustration = ({ hasDispute, ruling }) => (hasDispute ? illustrationMap[ruling] : illustrationMap.noDispute);

const StyledExplainer = styled.small`
  color: ${p => p.theme.color.text.light};
  font-size: ${p => p.theme.fontSize.sm};
`;
