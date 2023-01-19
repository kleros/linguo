import React from 'react';
import TaskAwaitingReviewAvatar from '~/assets/images/avatar-task-awaiting-review.svg';
import Spacer from '~/shared/Spacer';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import TaskDeadline from '../../components/TaskDeadline';
import ContextAwareTaskInteractionButton from '../../components/ContextAwareTaskInteractionButton';
import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import { useLinguoApi } from '~/hooks/useLinguo';
import Task from '~/utils/task';

function AwaitingReviewForTranslator() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);
  const { getReviewTimeout } = useLinguoApi();

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

  const reviewTimeout = getReviewTimeout();
  const remainingTime = Task.getRemainedReviewTime(task.status, task.lastInteraction, reviewTimeout);

  const props =
    remainingTime > 0
      ? {
          title,
          description: [
            'During review anyone can challenge this translation if they think it does not fulfill the quality requirements. ',
            'For this, they will be required to send a Challenger Deposit alongside an evidence file describing what is wrong with it.',
            'Then jurors from a specialized Kleros court will judge your translation. If they decide this translation should be accepted, you will receive the bounty + your Translator Deposit + the Challenger Deposit - Arbitration Fees. Otherwise, the requester receives the bounty back and your Translator Deposit goes to the challenger',
            'If the translation is not challenged, the task is finished and you will receive the bounty + your Translator Deposit back.',
          ],
          illustration: <TaskAwaitingReviewAvatar />,
        }
      : {
          title,
          description: [
            'The bounty + your Translator Deposit will be automatically sent to your wallet in a few moments.',
            'If you do not want to wait, you can claim them right now.',
          ],
          interaction: (
            <>
              <TaskDeadline />
              <Spacer />
              <ContextAwareTaskInteractionButton
                ID={task.taskID}
                interaction={ContextAwareTaskInteractionButton.Interaction.Accept}
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
