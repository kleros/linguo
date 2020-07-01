import React from 'react';
import { Dispute } from '~/features/disputes';
import { TaskParty } from '~/features/tasks';
import { WarningIcon } from '~/components/icons';
import EthValue from '~/components/EthValue';
import RefusedToRuleAvatar from '~/assets/images/avatar-refused-to-rule.svg';
import useTask from '../../../../useTask';
import TaskStatusDetailsLayout from '../../../components/TaskStatusDetailsLayout';
import useCurrentParty from '../../../hooks/useCurrentParty';
import DisputeContext from '../DisputeContext';

function JurorsRefusedToRule() {
  const party = useCurrentParty();

  const title = 'The jurors refused to vote';
  const illustration = <RefusedToRuleAvatar />;
  const description = descriptionNodeByParty[party]();

  return <TaskStatusDetailsLayout title={title} description={description} illustration={illustration} />;
}

const descriptionNodeByParty = {
  [TaskParty.Translator]: ForTranslator,
  [TaskParty.Challenger]: ForChallenger,
  [TaskParty.Requester]: ForRequester,
  [TaskParty.Other]: ForOther,
};

export default JurorsRefusedToRule;

function ForTranslator() {
  const dispute = React.useContext(DisputeContext);
  const totalAppealCost = Dispute.totalAppealCost(dispute, { party: TaskParty.Translator });

  const description = [
    'You will receive only your translation deposit (minus arbitration fees) back.',
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

function ForChallenger() {
  const dispute = React.useContext(DisputeContext);
  const totalAppealCost = Dispute.totalAppealCost(dispute, { party: TaskParty.Challenger });

  const { requester, parties } = useTask();
  const challengerIsRequester = requester === parties[TaskParty.Challenger];

  const description = [
    challengerIsRequester
      ? 'You will receive the escrow payment + your challenge deposit (minus arbitration fees) back.'
      : 'You will receive your challenge deposit (minus arbitration fees) back.',
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

function ForRequester() {
  const description = [
    'You will receive the escrow payment back.',
    'Note that you can still appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}

function ForOther() {
  const description = [
    'The requester will receive the escrow payment back. The translator will get the translation deposit back (minus arbitration fees). The challenger will get the challenge deposit (minus arbitration fees) back.',
    'Note that anyone can still appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}
