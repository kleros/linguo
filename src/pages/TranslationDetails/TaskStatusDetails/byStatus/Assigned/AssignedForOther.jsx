import React from 'react';
import TaskAssignedAvatar from '~/assets/images/avatar-task-assigned.svg';
import FormattedRelativeDate from '~/shared/FormattedRelativeDate';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import { useLinguoApi } from '~/hooks/useLinguo';

function AssignedForOther() {
  const { getReviewTimeout } = useLinguoApi();
  const reviewTimeout = getReviewTimeout();

  const props = {
    title: 'This translation task was assigned to a translator',
    description: [
      <FormattedRelativeDate
        key="next-steps"
        value={reviewTimeout}
        unit="second"
        render={({ formattedValue }) => (
          <>
            After the translation is submitted by the translator, it goes to the Review List for{' '}
            <strong>{formattedValue}</strong>.
          </>
        )}
      />,
      'During this time you can challenge the translation if you think it does not fulfill the quality requirements.',
    ],
    illustration: <TaskAssignedAvatar />,
  };

  return <TaskStatusDetailsLayout {...props} />;
}

export default AssignedForOther;
