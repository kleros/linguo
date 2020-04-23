import React from 'react';
import LinguoApiReadyGateway from '~/components/LinguoApiReadyGateway';
import SingleCardLayout from '../layouts/SingleCardLayout';
import TaskDetailsFetcher from './TaskDetailsFetcher';

function TranslationTaskDetails() {
  return (
    <SingleCardLayout title="Translation Task Details">
      <LinguoApiReadyGateway>
        <TaskDetailsFetcher />
      </LinguoApiReadyGateway>
    </SingleCardLayout>
  );
}

export default TranslationTaskDetails;
