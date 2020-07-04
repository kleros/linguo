import React from 'react';
import TranslatorSettingsForm from '~/features/translator/TranslatorSettingsForm';
import WithRouteMessage from '~/shared/WithRouteMessage';
import SingleCardLayout from './layouts/SingleCardLayout';

function TranslatorSettings() {
  return (
    <SingleCardLayout title="Set your language skills">
      <WithRouteMessage>
        <TranslatorSettingsForm />
      </WithRouteMessage>
    </SingleCardLayout>
  );
}

export default TranslatorSettings;
