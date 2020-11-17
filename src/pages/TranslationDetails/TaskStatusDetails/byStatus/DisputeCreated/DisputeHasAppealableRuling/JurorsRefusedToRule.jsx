import React from 'react';
import { Dispute } from '~/features/disputes';
import { TaskParty } from '~/features/tasks';
import { WarningIcon } from '~/shared/icons';
import EthValue from '~/shared/EthValue';
import RefusedToRuleAvatar from '~/assets/images/avatar-refused-to-rule.svg';
import useTask from '../../../../useTask';
import TaskStatusDetailsLayout from '../../../components/TaskStatusDetailsLayout';
import useCurrentParty from '../../../hooks/useCurrentParty';
import DisputeContext from '../DisputeContext';

function JurorsRefusedToRule() {
  const party = useCurrentParty();

  const dispute = React.useContext(DisputeContext);
  const totalAppealCost = Dispute.totalAppealCost(dispute, { party });

  const { requester, parties } = useTask();
  const challengerIsRequester = requester === parties[TaskParty.Challenger];

  const title = 'The jurors refused to vote';
  const illustration = <RefusedToRuleAvatar />;
  const description = descriptionNodeByParty[party]({ totalAppealCost, challengerIsRequester });

  return <TaskStatusDetailsLayout title={title} description={description} illustration={illustration} />;
}

const descriptionNodeByParty = {
  [TaskParty.Translator]: forTranslator,
  [TaskParty.Challenger]: forChallenger,
  [TaskParty.Requester]: forRequester,
  [TaskParty.Other]: forOther,
};

export default JurorsRefusedToRule;

function forTranslator({ totalAppealCost }) {
  const description = [
    'You will receive only your Translator Deposit - Arbitration Fees back.',
    'Note anyone appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
    <EthValue
      key="appeal-deposit"
      amount={totalAppealCost}
      suffixType="short"
      render={({ formattedValue, suffix }) => (
        <span
          css={`
            color: ${p => p.theme.color.warning.default};
          `}
        >
          <WarningIcon /> If there is an appeal, you be required a{' '}
          <strong>
            {formattedValue} {suffix}
          </strong>{' '}
          deposit, which you can provide yourself or be crowdfunded. If you fail to do so, you will automatically lose
          the dispute.
        </span>
      )}
    />,
  ];

  return description;
}

function forChallenger({ challengerIsRequester, totalAppealCost }) {
  const description = [
    challengerIsRequester
      ? 'You will receive the Requester Deposit + your Challenger Deposit - Arbitration Fees back.'
      : 'You will receive your Challenger Deposit - Arbitration Fees back.',
    'Note anyone appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
    <EthValue
      key="appeal-deposit"
      amount={totalAppealCost}
      suffixType="short"
      render={({ formattedValue, suffix }) => (
        <span
          css={`
            color: ${p => p.theme.color.warning.default};
          `}
        >
          <WarningIcon /> If there is an appeal, you be required a{' '}
          <strong>
            {formattedValue} {suffix}
          </strong>{' '}
          deposit, which you can provide yourself or be crowdfunded. If you fail to do so, you will automatically lose
          the dispute.
        </span>
      )}
    />,
  ];

  return description;
}

function forRequester() {
  const description = [
    'You will receive the Requester Deposit back.',
    'Note that you can still appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}

function forOther() {
  const description = [
    'The requester will receive the Requester Deposit back. The translator will get the Translator Deposit back - Arbitration Fees. The challenger will get the Challenger Deposit - Arbitration Fees back.',
    'Note that anyone can still appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}
