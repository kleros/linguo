import React from 'react';
import { Titled } from 'react-titled';
import TranslatorSettingsForm from '~/components/Translator/TranslatorSettingsForm';
import WithRouteMessage from '~/shared/WithRouteMessage';
import SingleCardLayout from '../layout/SingleCardLayout';

function TranslatorSettings() {
  return (
    <Titled title={title => `Translator Settings | ${title}`}>
      <SingleCardLayout title="Set Your Language Skills">
        <WithRouteMessage>
          <TranslatorSettingsForm />
        </WithRouteMessage>
      </SingleCardLayout>
    </Titled>
  );
}

export default TranslatorSettings;
