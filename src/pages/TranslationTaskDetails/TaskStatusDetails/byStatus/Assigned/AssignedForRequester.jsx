import React from 'react';
import TaskAssignedAvatar from '~/assets/images/avatar-task-assigned.svg';
import FormattedRelativeDate from '~/components/FormattedRelativeDate';
import TaskContext from '../../../TaskContext';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';

function AssignedForRequester() {
  const { reviewTimeout } = React.useContext(TaskContext);

  const props = {
    title: 'This translation task was assigned by a translator',
    description: [
      'You will be informed when the translation is delivered.',
      <FormattedRelativeDate
        key="next-steps"
        value={reviewTimeout}
        unit="second"
        render={({ formattedValue }) => (
          <>
            After this, it goes to the Review List for <strong>{formattedValue}</strong>.
          </>
        )}
      />,
      'During this time you can challenge the translation if you think it does not fulfill the quality requirements.',
    ],
    illustration: <TaskAssignedAvatar />,
  };

  return <TaskStatusDetailsLayout {...props} />;
}

export default AssignedForRequester;
