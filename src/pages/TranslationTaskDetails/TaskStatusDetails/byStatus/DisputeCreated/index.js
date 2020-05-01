import React from 'react';
import loadable from '@loadable/component';
import { TaskParty } from '~/app/linguo';
import Spinner from '../../components/Spinner';

const fallback = <Spinner />;

export default {
  [TaskParty.Requester]: loadable(() => import('./DisputeCreatedForRequester.jsx'), { fallback }),
  [TaskParty.Translator]: loadable(() => import('./DisputeCreatedForTranslator.jsx'), { fallback }),
  [TaskParty.Challenger]: loadable(() => import('./DisputeCreatedForChallenger.jsx'), { fallback }),
  [TaskParty.Other]: loadable(() => import('./DisputeCreatedForOther.jsx'), { fallback }),
};
