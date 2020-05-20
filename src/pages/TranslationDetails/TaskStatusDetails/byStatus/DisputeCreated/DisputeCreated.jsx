import React from 'react';
import loadable from '@loadable/component';
import { Dispute } from '~/app/linguo';
import Spinner from '../../components/Spinner';
import DisputeContext from './DisputeContext';
import { withDisputeFetcher } from './DisputeFetcher';

const fallback = <Spinner />;

const componentsByDisputeStatus = {
  waiting: loadable(() => import('./DisputeIsWaiting.jsx'), { fallback }),
  appealable: loadable(() => import('./DisputeHasAppealableRuling/index.js'), { fallback }),
  appealPeriodIsOver: loadable(() => import('./DisputeAppealPeriodIsOver.jsx'), { fallback }),
  solved: loadable(() => Promise.resolve({ default: () => null }), { fallback }),
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
