import React from 'react';
import { lazy } from '@loadable/component';
import { Dispute } from '~/app/linguo';
import useCurrentParty from '../../hooks/useCurrentParty';
import DisputeContext from './DisputeContext';
import { withDisputeFetcher } from './DisputeFetcher';

const componentsByDisputeStatus = {
  waiting: lazy(() => import('./DisputeIsWaiting')),
  appealable: lazy(() => import('./DisputeHasAppealableRuling')),
  appealPeriodIsOver: lazy(() => import('./DisputeAppealPeriodIsOver')),
  solved: lazy(() => Promise.resolve({ default: () => null })),
};

function DisputeCreated() {
  const dispute = React.useContext(DisputeContext);
  console.log(dispute);
  const party = useCurrentParty();

  let Component;
  if (Dispute.isWaiting(dispute)) {
    Component = componentsByDisputeStatus.waiting;
  } else if (Dispute.isAppealable(dispute)) {
    const canAppeal = Dispute.remainingTimeForAppeal(dispute, { party }) > 0;
    Component = canAppeal ? componentsByDisputeStatus.appealable : componentsByDisputeStatus.appealPeriodIsOver;
  } else {
    console.error('This should not happen!!!!');
    Component = componentsByDisputeStatus.solved;
  }

  return <Component />;
}

export default withDisputeFetcher(DisputeCreated);
