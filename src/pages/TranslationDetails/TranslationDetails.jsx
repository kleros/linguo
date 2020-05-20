import React from 'react';
import LinguoApiReadyGateway from '~/components/LinguoApiReadyGateway';
import SingleCardLayout from '../layouts/SingleCardLayout';
import TaskFetcher from './TaskFetcher';

function TranslationDetails() {
  return (
    <SingleCardLayout title="Translation Task Details">
      <LinguoApiReadyGateway>
        <TaskFetcher />
      </LinguoApiReadyGateway>
    </SingleCardLayout>
  );
}

export default TranslationDetails;
