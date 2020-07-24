import React from 'react';
import { TaskParty } from '~/features/tasks';
import { Dispute } from '~/features/disputes';
import { WarningIcon } from '~/shared/icons';
import EthValue from '~/shared/EthValue';
import TranslationApprovedAvatar from '~/assets/images/avatar-translation-approved.svg';
import useTask from '../../../../useTask';
import TaskStatusDetailsLayout from '../../../components/TaskStatusDetailsLayout';
import useCurrentParty from '../../../hooks/useCurrentParty';
import DisputeContext from '../DisputeContext';

function TranslationWasApproved() {
  const party = useCurrentParty();

  const title = 'The jurors approved the translation';
  const illustration = <TranslationApprovedAvatar />;
  const description = descriptionNodeByParty[party]();

  return <TaskStatusDetailsLayout title={title} description={description} illustration={illustration} />;
}

export default TranslationWasApproved;

const descriptionNodeByParty = {
  [TaskParty.Translator]: ForTranslator,
  [TaskParty.Challenger]: ForChallenger,
  [TaskParty.Requester]: ForRequester,
  [TaskParty.Other]: ForOther,
};

function ForTranslator() {
  const dispute = React.useContext(DisputeContext);
  const totalAppealCost = Dispute.totalAppealCost(dispute, { party: TaskParty.Translator });

  const description = [
    'You will receive the Requester Deposit + your Translator Deposit back + the Challenger Deposit - Arbitration Fees.',
    'Note that the challenger can still appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
    <EthValue
      key="appeal-deposit"
      amount={totalAppealCost}
      suffixType="short"
      render={({ formattedValue, suffix }) => (
        <>
          <WarningIcon /> If there is an appeal, you be required a{' '}
          <strong>
            {formattedValue} {suffix}
          </strong>{' '}
          deposit, which you can provide yourself or be crowdfunded. If you fail to do so, you will automatically lose
          the dispute.
        </>
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
      ? 'The Requester Deposit + your Challenger Deposit goes to the translator.'
      : 'Your Challenger Deposit goes to the translator.',
    'Note that you can still appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
    <EthValue
      key="appeal-deposit"
      amount={totalAppealCost}
      suffixType="short"
      render={({ formattedValue, suffix }) => (
        <>
          The appeal will require a{' '}
          <strong>
            {formattedValue} {suffix}
          </strong>{' '}
          deposit, which you can provide yourself or be crowdfunded.
        </>
      )}
    />,
  ];

  return description;
}

function ForRequester() {
  const dispute = React.useContext(DisputeContext);
  const totalAppealCost = Dispute.totalAppealCost(dispute, { party: TaskParty.Challenger });

  const description = [
    'Your Requester Deposit goes to the translator.',
    'Note that you can still appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
    <EthValue
      key="appeal-deposit"
      amount={totalAppealCost}
      suffixType="short"
      render={({ formattedValue, suffix }) => (
        <>
          The appeal will require a{' '}
          <strong>
            {formattedValue} {suffix}
          </strong>{' '}
          deposit, which you can provide yourself or be crowdfunded.
        </>
      )}
    />,
  ];

  return description;
}

function ForOther() {
  const description = [
    'The translator will receive the Requester Deposit + the Translator Deposit back + the Challenger Deposit - Arbitration Fees.',
    'Note that anyone can still appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}
