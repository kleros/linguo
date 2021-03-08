import React from 'react';
import TaskInteractionButton from '~/features/tasks/TaskInteractionButton';
import useTask from '../../useTask';

export default function ContextAwareTaskInteractionButton(props) {
  const { id } = useTask();

  return <TaskInteractionButton {...props} id={id} />;
}

ContextAwareTaskInteractionButton.Interaction = TaskInteractionButton.Interaction;
