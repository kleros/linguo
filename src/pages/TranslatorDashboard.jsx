import React from 'react';
import { Redirect } from 'react-router-dom';
import { useSettings, TRANSLATOR } from '~/app/settings';
import * as r from '~/app/routes';

export default function TranslatorMain() {
  const [{ languages }] = useSettings(TRANSLATOR.key, TRANSLATOR.initialValue);

  return languages?.length > 0 ? (
    <div>Translator Dashboard</div>
  ) : (
    <Redirect
      to={{
        pathname: r.TRANSLATOR_SETTINGS,
        state: {
          message: 'Please set your language skills first.',
        },
      }}
    />
  );
}
