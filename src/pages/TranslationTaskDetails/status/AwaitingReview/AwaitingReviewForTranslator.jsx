import React from 'react';
import { Task } from '~/app/linguo';
import TaskAwaitingReviewAvatar from '~/assets/images/avatar-task-awaiting-review.svg';
import Spacer from '~/components/Spacer';
import TaskContext from '../../TaskContext';
import VerticalSplitLayout from '../layout/VerticalSplit';
import TaskDeadline from '../components/TaskDeadline';
import TaskInteractionButton from '../components/TaskInteractionButton';

function AwaitingReviewForTranslator() {
  const task = React.useContext(TaskContext);

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
            'During review time if someone challenge the translation a dispute is open and specialized jurors are drawn to decide the case. ',
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
                interaction={TaskInteractionButton.Interaction.Accept}
                content={{ idle: 'Claim Payment' }}
                buttonProps={{ fullWidth: true }}
              />
            </>
          ),
        };

  return <VerticalSplitLayout {...props} />;
}

export default AwaitingReviewForTranslator;
