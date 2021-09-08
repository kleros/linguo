import React from 'react';
import { Alert } from '~/adapters/antd';
import { TaskParty } from '~/features/tasks';
import { Dispute } from '~/features/disputes';
import EthValue from '~/shared/EthValue';
import Spacer from '~/shared/Spacer';
import TranslationApprovedAvatar from '~/assets/images/avatar-translation-approved.svg';
import useTask from '../../../../useTask';
import TaskStatusDetailsLayout from '../../../components/TaskStatusDetailsLayout';
import useCurrentParty from '../../../hooks/useCurrentParty';
import DisputeContext from '../DisputeContext';

function TranslationWasApproved() {
  const party = useCurrentParty();

  const dispute = React.useContext(DisputeContext);
  const totalAppealCost = Dispute.totalAppealCost(dispute, { party });

  const { requester, parties } = useTask();
  const challengerIsRequester = requester === parties[TaskParty.Challenger];

  const title = 'The jurors approved the translation';
  const illustration = <TranslationApprovedAvatar />;
  const description = descriptionNodeByParty[party]({ totalAppealCost, challengerIsRequester });

  return <TaskStatusDetailsLayout title={title} description={description} illustration={illustration} />;
}

export default TranslationWasApproved;

const descriptionNodeByParty = {
  [TaskParty.Translator]: ForTranslator,
  [TaskParty.Challenger]: ForChallenger,
  [TaskParty.Requester]: ForRequester,
  [TaskParty.Other]: ForOther,
};

function ForTranslator({ totalAppealCost }) {
  const description = [
    'You will receive the bounty + your Translator Deposit back + the Challenger Deposit - Arbitration Fees.',
    'Note that the challenger can still appeal the decision, which will lead to another jurors round that may or may not revert this decision.',
    <Spacer key="spacer" />,
    <Alert
      key="alert"
      showIcon
      type="info"
      message={
        <>
          If there is an appeal, you be required a{' '}
          <strong>
            <EthValue key="appeal-deposit" amount={totalAppealCost} suffixType="short" />
          </strong>{' '}
          deposit. You can provide it yourself or it can be crowdfunded. If you fail to do so, you will automatically
          lose the dispute.
        </>
      }
    />,
  ];

  return description;
}

function ForChallenger({ challengerIsRequester, totalAppealCost }) {
  const description = [
    challengerIsRequester
      ? 'The bounty + your Challenger Deposit goes to the translator.'
      : 'Your Challenger Deposit goes to the translator.',
    'Note that you can still appeal the decision, which will lead to another jurors round that may or may not revert this decision.',
    <Spacer key="spacer" />,
    <Alert
      key="alert"
      showIcon
      type="info"
      size="small"
      message={
        <>
          The appeal will require a{' '}
          <strong>
            <EthValue key="appeal-deposit" amount={totalAppealCost} suffixType="short" />
          </strong>{' '}
          deposit. You can provide it yourself or it can be crowdfunded. If you fail to do so, you will automatically
          lose the dispute.
        </>
      }
    />,
  ];

  return description;
}

function ForRequester({ totalAppealCost }) {
  const description = [
    'The bounty goes to the translator.',
    'Note that anyone (including yourself) can still appeal the decision, which will lead to another jurors round that may or may not revert this decision.',
    <Spacer key="spacer" />,
    <Alert
      key="alert"
      showIcon
      type="info"
      size="small"
      message={
        <>
          The appeal will require a{' '}
          <strong>
            <EthValue key="appeal-deposit" amount={totalAppealCost} suffixType="short" />
          </strong>{' '}
          deposit. You can provide it yourself or it can be crowdfunded. If you fail to do so, you will automatically
          lose the dispute.
        </>
      }
    />,
  ];

  return description;
}

function ForOther() {
  const description = [
    'The translator will receive the bounty + the Translator Deposit back + the Challenger Deposit - Arbitration Fees.',
    'Note that anyone can still appeal the decision, which will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}
