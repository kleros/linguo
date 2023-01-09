import React from 'react';
import { Alert } from '~/adapters/antd';
import { TaskParty } from '~/features/tasks';
import EthValue from '~/shared/EthValue';
import Spacer from '~/shared/Spacer';
import TranslationRejectedAvatar from '~/assets/images/avatar-translation-rejected.svg';
import TaskStatusDetailsLayout from '../../../components/TaskStatusDetailsLayout';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useDispute } from '~/hooks/useDispute';
import { useTask } from '~/hooks/useTask';

function TranslationWasRejected() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const { disputeID, latestRoundId, challenger, requester, currentParty } = task;
  const { dispute } = useDispute(disputeID, latestRoundId);

  const challengerIsRequester = requester === challenger;

  const title = 'The jurors did not approve the translation';
  const description = getDescriptionByParty[currentParty]({
    totalAppealCost: dispute.totalAppealCost(currentParty),
    challengerIsRequester,
  });
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
    'The bounty goes back to the task requester and your Translator Deposit goes to the challenger.',
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
      ? 'The bounty + your Challenger Deposit will be sent back to you.'
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
    'The bounty will be sent back to you.',
    'Note that anyone can appeal the decision, which will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}

function ForOther() {
  const description = [
    'The challenger will receive the Translator Deposit. The requester will be refunded of the bounty.',
    'Note that anyone can appeal the decision, which will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}
