import React from 'react';
import { Redirect } from 'react-router-dom';
import useTranslatorSettings from '~/hooks/useTranslatorSettings';
import * as r from '~/app/routes';

export default function TranslatorMain() {
  const [{ languages }] = useTranslatorSettings();

  return languages.length === 0 ? (
    <Redirect
      to={{
        pathname: r.TRANSLATOR_SETTINGS,
        state: {
          message: 'Please set your language skills first.',
        },
      }}
    />
  ) : (
    <div>Translator Dashboard</div>
  );
}
