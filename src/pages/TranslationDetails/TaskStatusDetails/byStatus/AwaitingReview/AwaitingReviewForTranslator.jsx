import React from 'react';
import { Task } from '~/features/tasks';
import TaskAwaitingReviewAvatar from '~/assets/images/avatar-task-awaiting-review.svg';
import Spacer from '~/shared/Spacer';
import useTask from '../../../useTask';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import TaskDeadline from '../../components/TaskDeadline';
import ContextAwareTaskInteractionButton from '../../components/ContextAwareTaskInteractionButton';

function AwaitingReviewForTranslator() {
  const task = useTask();

  const title = (
    <TaskDeadline
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
  );

  const remainingTime = Task.remainingTimeForReview(task, { currentDate: new Date() });
  const props =
    remainingTime > 0
      ? {
          title,
          description: [
            'During review anyone can challenge this translation if they think it does not fulfill the quality requirements. ',
            'For this, they will be required to send a Challenger Deposit alongside an evidence file describing what is wrong with it.',
            'Then jurors from a specialized Kleros court will judge your translation. If they decide this translation should be accepted, you will receive the Requester Deposit + your Translator Deposit + the Challenger Deposit - Arbitration Fees. Otherwise, the requester receives the Requester Deposit back and your Translator Deposit goes to the challenger',
            'If the translation is not challenged, the task is finished and you will receive the Requester Deposit + your Translator Deposit back.',
          ],
          illustration: <TaskAwaitingReviewAvatar />,
        }
      : {
          title,
          description: [
            'The Requester Deposit + your Translator Deposit will be automatically sent to your wallet in a few moments.',
            'If you do not want to wait, you can claim them right now.',
          ],
          interaction: (
            <>
              <TaskDeadline />
              <Spacer />
              <ContextAwareTaskInteractionButton
                ID={task.ID}
                interaction={ContextAwareTaskInteractionButton.Interaction.Approve}
                content={{
                  idle: { text: 'Claim Payment' },
                }}
                buttonProps={{ fullWidth: true }}
              />
            </>
          ),
        };

  return <TaskStatusDetailsLayout {...props} />;
}

export default AwaitingReviewForTranslator;
