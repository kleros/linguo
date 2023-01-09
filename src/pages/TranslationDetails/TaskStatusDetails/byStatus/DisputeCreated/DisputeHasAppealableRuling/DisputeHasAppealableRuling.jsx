import React from 'react';
import loadable from '@loadable/component';

import Spacer from '~/shared/Spacer';
import AppealStatus from './AppealStatus';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import { useDispute } from '~/hooks/useDispute';
import disputeRuling from '~/consts/disputeRuling';

const componentsByRuling = {
  // eslint-disable-next-line import/extensions
  [disputeRuling.TranslationApproved]: loadable(() => import('./TranslationWasApproved.jsx')),
  // eslint-disable-next-line import/extensions
  [disputeRuling.TranslationRejected]: loadable(() => import('./TranslationWasRejected.jsx')),
  // eslint-disable-next-line import/extensions
  [disputeRuling.RefuseToRule]: loadable(() => import('./JurorsRefusedToRule.jsx')),
  [disputeRuling.None]: () => `Ooops, this shouldn't happen!`,
};

function DisputeHasAppealableRuling() {
  // const { ruling } = React.useContext(DisputeContext);

  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const { disputeID, latestRoundId } = task;
  const { dispute } = useDispute(disputeID, latestRoundId);
  const RulingComponent = componentsByRuling[dispute.ruling];

  return (
    <>
      <RulingComponent />
      <Spacer size={3} />
      <AppealStatus />
    </>
  );
}

export default DisputeHasAppealableRuling;
