import React from 'react';
import __lazy from '@loadable/component';
import { DisputeRuling } from '~/app/linguo';
import Spacer from '~/components/Spacer';
import DisputeContext from '../DisputeContext';
import AppealStatus from './AppealStatus';

const componentsByRuling = {
  [DisputeRuling.TranslationApproved]: __lazy(() => import('./TranslationWasApproved.jsx')),
  [DisputeRuling.TranslationRejected]: __lazy(() => import('./TranslationWasRejected.jsx')),
  [DisputeRuling.RefuseToRule]: __lazy(() => import('./JurorsRefusedToRule.jsx')),
  [DisputeRuling.None]: () => `Ooops, this shouldn't happen!`,
};

function DisputeHasAppealableRuling() {
  const { ruling } = React.useContext(DisputeContext);
  const RulingComponent = componentsByRuling[ruling];

  return (
    <>
      <RulingComponent />
      <Spacer size={3} />
      <AppealStatus />
    </>
  );
}

export default DisputeHasAppealableRuling;
