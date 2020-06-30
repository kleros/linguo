import React from 'react';
import { Task } from '~/app/linguo';
import TaskAwaitingReviewAvatar from '~/assets/images/avatar-task-awaiting-review.svg';
import Spacer from '~/components/Spacer';
import useTask from '../../../useTask';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import TaskDeadline from '../../components/TaskDeadline';
import TaskInteractionButton from '../../components/TaskInteractionButton';

function AwaitingReviewForTranslator() {
  const task = useTask();

  const title = (
    <TaskDeadline
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
  );

  const remainingTime = Task.remainingTimeForReview(task, { currentDate: new Date() });
  const props =
    remainingTime > 0
      ? {
          title,
          description: [
            'During review you can challenge the translation if you think it does not fulfill the quality requirements. To do so, you need to send a challenge deposit alongside an evidence file describing what is wrong with it.',
            'If so, you will be asked to deposit the arbitration fee as well. But, if the translation is not challenged, the task is finished and you receive the escrow payment + your translation deposit back.',
          ],
          illustration: <TaskAwaitingReviewAvatar />,
        }
      : {
          title,
          description: [
            'Your payment and the deposit you made when assigned to this task will be automatically sent to your wallet in a few moments.',
            'If you do not want to wait, you can claim your payment + your deposit back now.',
          ],
          interaction: (
            <>
              <TaskDeadline />
              <Spacer />
              <TaskInteractionButton
                ID={task.ID}
                interaction={TaskInteractionButton.Interaction.Approve}
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
