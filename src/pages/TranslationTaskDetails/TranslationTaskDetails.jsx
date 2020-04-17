import React from 'react';
import RequiredWeb3Gateway from '~/components/RequiredWeb3Gateway';
import SingleCardLayout from '../layouts/SingleCardLayout';
import TaskDetailsFetcher from './TaskDetailsFetcher';

function TranslationTaskDetails() {
  return (
    <SingleCardLayout title="Translation Task Details">
      <RequiredWeb3Gateway>
        <TaskDetailsFetcher />
      </RequiredWeb3Gateway>
    </SingleCardLayout>
  );
}

export default TranslationTaskDetails;
