import React from 'react';
import loadable from '@loadable/component';
import { TaskParty } from '~/app/linguo';
import Spinner from '../../components/Spinner';

const fallback = <Spinner />;

export default {
  [TaskParty.Requester]: loadable(() => import('./DisputeCreated.jsx'), { fallback }),
  [TaskParty.Translator]: loadable(() => import('./DisputeCreated.jsx'), { fallback }),
  [TaskParty.Challenger]: loadable(() => import('./DisputeCreated.jsx'), { fallback }),
  [TaskParty.Other]: loadable(() => import('./DisputeCreated.jsx'), { fallback }),
};
