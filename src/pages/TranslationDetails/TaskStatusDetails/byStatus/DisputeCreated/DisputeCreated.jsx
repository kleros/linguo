import React from 'react';
import loadable from '@loadable/component';
import { Dispute } from '~/features/disputes';
import Spinner from '../../components/Spinner';
import DisputeContext from './DisputeContext';
import { withDisputeFetcher } from './DisputeFetcher';

const fallback = <Spinner />;

const componentsByDisputeStatus = {
  // eslint-disable-next-line import/extensions
  waiting: loadable(() => import('./DisputeIsWaiting.jsx'), { fallback }),
  // eslint-disable-next-line import/extensions
  appealable: loadable(() => import('./DisputeHasAppealableRuling/index.js'), { fallback }),
  // eslint-disable-next-line import/extensions
  solvedButNotExecuted: loadable(() => import('./DisputeSolvedButNotExecuted.jsx'), { fallback }),
};

function DisputeCreated() {
  const dispute = React.useContext(DisputeContext);

  let Component;
  if (Dispute.isWaiting(dispute)) {
    Component = componentsByDisputeStatus.waiting;
  } else if (Dispute.isAppealable(dispute)) {
    Component = componentsByDisputeStatus.appealable;
  } else {
    Component = componentsByDisputeStatus.solvedButNotExecuted;
  }

  return <Component />;
}

export default withDisputeFetcher(DisputeCreated);
