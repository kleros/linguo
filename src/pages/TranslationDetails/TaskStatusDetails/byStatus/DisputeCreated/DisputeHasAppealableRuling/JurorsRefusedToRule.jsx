import React from 'react';
import { Alert } from '~/adapters/antd';
import RefusedToRuleAvatar from '~/assets/images/avatar-refused-to-rule.svg';
import { TaskParty } from '~/features/tasks';

import { useDispute } from '~/hooks/useDispute';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import { useWeb3 } from '~/hooks/useWeb3';

import EthValue from '~/shared/EthValue';
import Spacer from '~/shared/Spacer';
import TaskStatusDetailsLayout from '../../../components/TaskStatusDetailsLayout';

function JurorsRefusedToRule() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const { disputeID, latestRoundId, challenger, requester, currentParty } = task;
  const { dispute } = useDispute(disputeID, latestRoundId);

  const { totalAppealCost } = dispute;
  const challengerIsRequester = requester === challenger;

  const title = 'The jurors refused to vote';
  const illustration = <RefusedToRuleAvatar />;

  const description = descriptionNodeByParty[currentParty]({
    totalAppealCost: totalAppealCost(currentParty),
    challengerIsRequester,
  });

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

function forChallenger({ challengerIsRequester, totalAppealCost }) {
  const description = [
    challengerIsRequester
      ? 'You will receive the bounty + your Challenger Deposit - Arbitration Fees back.'
      : 'You will receive your Challenger Deposit - Arbitration Fees back.',
    'Note anyone appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
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

function forRequester() {
  const description = [
    'You will receive the bounty back.',
    'Note that you can still appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}

function forOther() {
  const description = [
    'The requester will receive the bounty back. The translator will get the Translator Deposit back - Arbitration Fees. The challenger will get the Challenger Deposit - Arbitration Fees back.',
    'Note that anyone can still appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}
