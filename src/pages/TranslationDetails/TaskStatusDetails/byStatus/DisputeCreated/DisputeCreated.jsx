import React from 'react';
import loadable from '@loadable/component';

import Spinner from '../../components/Spinner';
import { withDisputeFetcher } from './DisputeFetcher';

import { useDispute } from '~/hooks/useDispute';
import { useTask } from '~/hooks/useTask';
import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';

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
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const { disputeID, latestRoundId } = task;
  const { dispute } = useDispute(disputeID, latestRoundId);

  let Component;
  if (dispute.isWaiting) {
    Component = componentsByDisputeStatus.waiting;
  } else if (dispute.isAppealable) {
    Component = componentsByDisputeStatus.appealable;
  } else {
    Component = componentsByDisputeStatus.solvedButNotExecuted;
  }

  return <Component />;
}

export default withDisputeFetcher(DisputeCreated);
