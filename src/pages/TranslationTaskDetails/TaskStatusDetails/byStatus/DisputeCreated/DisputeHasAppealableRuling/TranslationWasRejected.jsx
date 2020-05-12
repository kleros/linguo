import React from 'react';
import { Dispute, TaskParty } from '~/app/linguo';
import { WarningIcon } from '~/components/icons';
import EthValue from '~/components/EthValue';
import TranslationRejectedAvatar from '~/assets/images/avatar-translation-rejected.svg';
import TaskContext from '../../../../TaskContext';
import VerticalSplitLayout from '../../../layout/VerticalSplit';
import useCurrentParty from '../../../hooks/useCurrentParty';
import DisputeContext from '../DisputeContext';

function TranslationWasRejected() {
  const party = useCurrentParty();

  const title = 'The jurors did not approve the translation';
  const description = getDescriptionByParty[party]();
  const illustration = <TranslationRejectedAvatar />;

  return <VerticalSplitLayout title={title} description={description} illustration={illustration} />;
}

export default TranslationWasRejected;

const getDescriptionByParty = {
  [TaskParty.Translator]: ForTranslator,
  [TaskParty.Challenger]: ForChallenger,
  [TaskParty.Requester]: ForRequester,
  [TaskParty.Other]: ForOther,
};

function ForTranslator() {
  const dispute = React.useContext(DisputeContext);
  const totalAppealCost = Dispute.totalAppealCost(dispute, { party: TaskParty.Translator });

  const description = [
    'The escrow payment goes back to the task requester and your deposit goes to the challenger.',
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

function ForChallenger() {
  const dispute = React.useContext(DisputeContext);
  const totalAppealCost = Dispute.totalAppealCost(dispute, { party: TaskParty.Challenger });

  const { requester, parties } = React.useContext(TaskContext);
  const challengerIsRequester = requester === parties[TaskParty.Challenger];

  const description = [
    challengerIsRequester
      ? 'The escrow payment + your challenge deposit goes to the translator.'
      : 'Your challenge deposit goes to the translator.',
    'Note that you can still appeal the decision, what will lead to another jurors round that may or may not revert this decision. To do so you need to deposit the appeal fee.',
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
    'Your escrow payment goes to the translator.',
    'Note that anyone can appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}

function ForOther() {
  const description = [
    'The translator will receive the escrow payment + the translation deposit back + the challenger’s deposit (minus arbitration fees).',
    'Note that anyone can appeal the decision, what will lead to another jurors round that may or may not revert this decision.',
  ];

  return description;
}
