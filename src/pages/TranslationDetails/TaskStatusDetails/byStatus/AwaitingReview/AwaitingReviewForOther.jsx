import React from 'react';
import { Task } from '~/app/linguo';
import Spacer from '~/components/Spacer';
import FormattedRelativeDate from '~/components/FormattedRelativeDate';
import TaskContext from '../../../TaskContext';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import TaskDeadline from '../../components/TaskDeadline';
import TaskInteractionButton from '../../components/TaskInteractionButton';
import ChallengeUploadButton from '../../components/ChallengeUploadButton';
import TranslationChallengeDepositFetcher from '../../components/TranslationChallengeDepositFetcher';

function AwaitingReviewForOther() {
  const task = React.useContext(TaskContext);

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
            'During review you can challenge the translation if you think it does not fulfill the quality requirements. To do so, you need to send a challenge deposit.',
            'If the jurors decide to not approve the translation you receive your challenge deposit back + the deposit of the translator (minus arbitration fees).',
            'If the translation is approved by the jurors your challenge deposit goes to the translator.',
          ]
        : [
            'Since no one challenged the translation during the review period, the translator will be automatically paid in a few moments.',
            'If you want to speed up the process, you can release the escrow payment to the translator right the way. There will be no cost for you beyond the gas used to send the transaction.',
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

export default AwaitingReviewForOther;
