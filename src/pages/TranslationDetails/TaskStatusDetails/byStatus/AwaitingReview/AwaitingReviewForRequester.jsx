import React from 'react';
import { Task } from '~/features/tasks';
import Spacer from '~/shared/Spacer';
import FormattedRelativeDate from '~/shared/FormattedRelativeDate';
import useTask from '../../../useTask';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import TaskDeadline from '../../components/TaskDeadline';
import ContextAwareTaskInteractionButton from '../../components/ContextAwareTaskInteractionButton';
import ChallengeUploadButton from '../../components/ChallengeUploadButton';
import TranslationChallengeRewardFetcher from '../../components/TranslationChallengeRewardFetcher';
import TranslationChallengeDepositFetcher from '../../components/TranslationChallengeDepositFetcher';

function AwaitingReviewForRequester() {
  const task = useTask();

  const remainingTime = Task.remainingTimeForReview(task, { currentDate: new Date() });

  const props = {
    title: (
      <FormattedRelativeDate
        value={task.reviewTimeout}
        unit="second"
        render={({ value, formattedValue }) =>
          value > 0 ? (
            <>
              Translation delivered. Under review for <strong>{formattedValue}</strong>.
            </>
          ) : (
            'Review period is over'
          )
        }
      />
    ),
    description:
      remainingTime > 0
        ? [
            'During the review period, anyone (including yourself) can challenge the submission if they think it does not fulfill the quality requirements.',
            'For this, the challenger needs to send a Challenger Deposit and an evidence file describing what is wrong with the translated text.',
            'If jurors decide to reject the translation you will receive the bounty back. Also if you are the one who raised the challenge, you will also receive the Challenger Deposit + the Translator Deposit - Arbitration Fees.',
            'Otherwise, the translator will receive the bounty + the Challenger Deposit',
          ]
        : [
            'Since no one challenged the translation during the review period, the translator will be automatically paid in a few moments.',
            'If you want, you can send the payment right the way.',
          ],
    interaction: (
      <>
        {remainingTime > 0 && (
          <>
            <TranslationChallengeRewardFetcher />
            <Spacer />
          </>
        )}
        <TaskDeadline />
        <Spacer />
        {remainingTime === 0 ? (
          <ContextAwareTaskInteractionButton
            ID={task.ID}
            interaction={ContextAwareTaskInteractionButton.Interaction.Approve}
            content={{
              idle: { text: 'Pay Translator' },
            }}
            buttonProps={{ fullWidth: true }}
          />
        ) : (
          <>
            <ChallengeUploadButton buttonProps={{ fullWidth: true }} />
            <Spacer size={0.5} />
            <TranslationChallengeDepositFetcher />
          </>
        )}
      </>
    ),
  };

  return <TaskStatusDetailsLayout {...props} />;
}

export default AwaitingReviewForRequester;
