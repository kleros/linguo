import React from 'react';
import TaskCreatedAvatar from '~/assets/images/avatar-task-created.svg';
import VerticalSplitLayout from '../../layout/VerticalSplit';

function CreatedForRequester() {
  const title = 'This translation was not assigned yet';

  const props = {
    title,
    description: ['You will be informed when a translator assigns to this task.'],
    illustration: <TaskCreatedAvatar />,
  };
  return <VerticalSplitLayout {...props} />;
}

export default CreatedForRequester;
