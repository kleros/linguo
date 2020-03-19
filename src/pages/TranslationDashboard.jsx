import React from 'react';
import { Redirect } from 'react-router-dom';
import * as r from '~/app/routes';

function TranslationDashboard() {
  return <Redirect to={r.TRANSLATION_CREATION} />;
}

export default TranslationDashboard;
