import React from 'react';
import TaskInteractionButton from '~/features/tasks/TaskInteractionButton';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import { useWeb3 } from '~/hooks/useWeb3';

export default function ContextAwareTaskInteractionButton(props) {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  return <TaskInteractionButton {...props} id={task.taskID} />;
}

ContextAwareTaskInteractionButton.Interaction = TaskInteractionButton.Interaction;
