import React from 'react';
import { Alert } from '~/adapters/antd';
import { TaskParty } from '~/features/tasks';
import { Dispute } from '~/features/disputes';
import EthValue from '~/shared/EthValue';
import Spacer from '~/shared/Spacer';
import TranslationRejectedAvatar from '~/assets/images/avatar-translation-rejected.svg';
import useTask from '../../../../useTask';
import TaskStatusDetailsLayout from '../../../components/TaskStatusDetailsLayout';
import useCurrentParty from '../../../hooks/useCurrentParty';
import DisputeContext from '../DisputeContext';

function TranslationWasRejected() {
  const party = useCurrentParty();

  const dispute = React.useContext(DisputeContext);
  const totalAppealCost = Dispute.totalAppealCost(dispute, { party });

  const { requester, parties } = useTask();
  const challengerIsRequester = requester === parties[TaskParty.Challenger];

  const title = 'The jurors did not approve the translation';
  const description = getDescriptionByParty[party]({ totalAppealCost, challengerIsRequester });
  const illustration = <TranslationRejectedAvatar />;

  return <TaskStatusDetailsLayout title={title} description={description} illustration={illustration} />;
}

export default TranslationWasRejected;

const getDescriptionByParty = {
  [TaskParty.Translator]: ForTranslator,
  [TaskParty.Challenger]: ForChallenger,
  [TaskParty.Requester]: ForRequester,
  [TaskParty.Other]: ForOther,
};

function ForTranslator({ totalAppealCost }) {
  const description = [
    'The Requester Deposit goes back to the task requester and your Translator Deposit goes to the challenger.',
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

function ForChallenger({ challengerIsRequester, totalAppealCost }) {
  const description = [
    challengerIsRequester
      ? 'Your Requester Deposit + your Challenger Deposit will be sent back to you.'
      : 'Your Challenger Deposit will be sent back to you.',
    'Note that the translator can still appeal the decision, which will lead to another jurors round that may or may not revert this decision. To do so you need to deposit the appeal fee.',
    <Spacer key="spacer" />,
    <Alert
      key="alert"
      showIcon
      type="info"
      size="small"
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

function ForRequester() {
  const description = [
    'Your Requester Deposit wil be sent back to you.',
    'Note that anyone can appeal the decision, which will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}

function ForOther() {
  const description = [
    'The challenger will receive the Translator Deposit. The requester will be refunded of the Requester Deposit.',
    'Note that anyone can appeal the decision, which will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}
