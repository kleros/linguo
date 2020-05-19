import React from 'react';
import __lazy from '@loadable/component';
import { Dispute } from '~/app/linguo';
import DisputeContext from './DisputeContext';
import { withDisputeFetcher } from './DisputeFetcher';

const componentsByDisputeStatus = {
  waiting: __lazy(() => import('./DisputeIsWaiting.jsx')),
  appealable: __lazy(() => import('./DisputeHasAppealableRuling/index.js')),
  appealPeriodIsOver: __lazy(() => import('./DisputeAppealPeriodIsOver.jsx')),
  solved: __lazy(() => Promise.resolve({ default: () => null })),
};

function DisputeCreated() {
  const dispute = React.useContext(DisputeContext);

  let Component;
  if (Dispute.isWaiting(dispute)) {
    Component = componentsByDisputeStatus.waiting;
  } else if (Dispute.isAppealable(dispute)) {
    Component = Dispute.isWithinAppealPeriod(dispute)
      ? componentsByDisputeStatus.appealable
      : componentsByDisputeStatus.appealPeriodIsOver;
  } else {
    console.error('This should not happen!!!!');
    Component = componentsByDisputeStatus.solved;
  }

  return <Component />;
}

export default withDisputeFetcher(DisputeCreated);
