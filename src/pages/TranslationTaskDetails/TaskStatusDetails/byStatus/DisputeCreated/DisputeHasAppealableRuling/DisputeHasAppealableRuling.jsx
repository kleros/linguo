import React from 'react';
import { lazy } from '@loadable/component';
import { DisputeRuling } from '~/app/linguo';
import DisputeContext from '../DisputeContext';

const componentsByRuling = {
  [DisputeRuling.TranslationApproved]: lazy(() => import('./TranslationWasApproved')),
  [DisputeRuling.TranslationRejected]: lazy(() => import('./TranslationWasRejected')),
  [DisputeRuling.RefuseToRule]: lazy(() => import('./JurorsRefusedToRule')),
  [DisputeRuling.None]: () => `Ooops, this shouldn't happen!`,
};

function DisputeHasAppealableRuling() {
  const { ruling } = React.useContext(DisputeContext);
  const Component = componentsByRuling[ruling];

  return <Component />;
}

export default DisputeHasAppealableRuling;
