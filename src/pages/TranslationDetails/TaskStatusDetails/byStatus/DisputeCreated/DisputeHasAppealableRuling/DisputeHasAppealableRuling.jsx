import React from 'react';
import loadable from '@loadable/component';
import { DisputeRuling } from '~/features/disputes';
import Spacer from '~/components/Spacer';
import DisputeContext from '../DisputeContext';
import AppealStatus from './AppealStatus';

const componentsByRuling = {
  [DisputeRuling.TranslationApproved]: loadable(() => import('./TranslationWasApproved.jsx')),
  [DisputeRuling.TranslationRejected]: loadable(() => import('./TranslationWasRejected.jsx')),
  [DisputeRuling.RefuseToRule]: loadable(() => import('./JurorsRefusedToRule.jsx')),
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
