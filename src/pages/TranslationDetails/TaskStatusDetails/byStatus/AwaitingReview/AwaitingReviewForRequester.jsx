import React from 'react';
import { Task } from '~/features/tasks';
import Spacer from '~/shared/Spacer';
import FormattedRelativeDate from '~/shared/FormattedRelativeDate';
import useTask from '../../../useTask';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import TaskDeadline from '../../components/TaskDeadline';
import TaskInteractionButton from '../../components/TaskInteractionButton';
import ChallengeUploadButton from '../../components/ChallengeUploadButton';
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
              Translation delivered. (In review for <strong>{formattedValue}</strong>)
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
            'During review you can challenge the translation if you think it does not fulfill the quality requirements. To do so, you need to send a challenge deposit alongside an evidence file describing what is wrong with it.',
            'If the jurors decide to not approve the translation you receive the escrow deposit back + the challenge deposit back + the deposit of the translator (minus arbitration fees).',
            'If the translation is approved by the jurors you lose the challenge deposit and the escrow payment goes to the translator.',
          ]
        : [
            'Since no one challenged the translation during the review period, the translator will be automatically paid in a few moments.',
            'If you want, you can send the payment to the translator right the way.',
          ],
    interaction: (
      <>
        <TaskDeadline />
        <Spacer />
        {remainingTime === 0 ? (
          <TaskInteractionButton
            ID={task.ID}
            interaction={TaskInteractionButton.Interaction.Approve}
            content={{
              idle: { text: 'Pay Translator' },
            }}
            buttonProps={{ fullWidth: true }}
          />
        ) : (
          <>
            <ChallengeUploadButton buttonProps={{ fullWidth: true }} />
            <Spacer />
            <TranslationChallengeDepositFetcher />
          </>
        )}
      </>
    ),
  };

  return <TaskStatusDetailsLayout {...props} />;
}

export default AwaitingReviewForRequester;
