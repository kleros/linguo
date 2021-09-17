import React from 'react';
import loadable from '@loadable/component';
import { DisputeRuling } from '~/features/disputes';
import Spacer from '~/shared/Spacer';
import DisputeContext from '../DisputeContext';
import AppealStatus from './AppealStatus';

const componentsByRuling = {
  // eslint-disable-next-line import/extensions
  [DisputeRuling.TranslationApproved]: loadable(() => import('./TranslationWasApproved.jsx')),
  // eslint-disable-next-line import/extensions
  [DisputeRuling.TranslationRejected]: loadable(() => import('./TranslationWasRejected.jsx')),
  // eslint-disable-next-line import/extensions
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
