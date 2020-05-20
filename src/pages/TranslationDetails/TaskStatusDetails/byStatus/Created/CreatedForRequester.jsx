import React from 'react';
import TaskCreatedAvatar from '~/assets/images/avatar-task-created.svg';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';

function CreatedForRequester() {
  const title = 'This translation was not assigned yet';

  const props = {
    title,
    description: ['You will be informed when a translator assigns to this task.'],
    illustration: <TaskCreatedAvatar />,
  };
  return <TaskStatusDetailsLayout {...props} />;
}

export default CreatedForRequester;
