import React from 'react';
import Spacer from '~/shared/Spacer';
import FormattedRelativeDate from '~/shared/FormattedRelativeDate';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import TaskDeadline from '../../components/TaskDeadline';
import TranslationUploadButton from '../../components/TranslationUploadButton';
import { useLinguoApi } from '~/hooks/useLinguo';

function AssignedForTranslator() {
  const { getReviewTimeout } = useLinguoApi();
  const reviewTimeout = getReviewTimeout();

  const props = {
    title: 'Deliver the translation file',
    description: [
      <FormattedRelativeDate
        key="next-steps"
        value={reviewTimeout}
        unit="second"
        render={({ formattedValue }) => (
          <>
            After uploading the translation file, it goes to the Review List for <strong>{formattedValue}</strong>.
          </>
        )}
      />,
      'While in Review List, the translation can be challenged by the task requester or any other translator if they think it does not fulfill the quality requirements.',
    ],
    interaction: (
      <>
        <TaskDeadline />
        <Spacer />
        <TranslationUploadButton buttonProps={{ fullWidth: true }} />
      </>
    ),
  };

  return <TaskStatusDetailsLayout {...props} />;
}

export default AssignedForTranslator;
