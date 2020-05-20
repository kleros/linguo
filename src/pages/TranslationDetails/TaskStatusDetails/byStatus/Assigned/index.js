import React from 'react';
import loadable from '@loadable/component';
import { TaskParty } from '~/app/linguo';
import Spinner from '../../components/Spinner';
import withResolveComponentByParty from '../withResolveComponentByParty';

const fallback = <Spinner />;

export default withResolveComponentByParty({
  [TaskParty.Requester]: loadable(() => import('./AssignedForRequester.jsx'), { fallback }),
  [TaskParty.Translator]: loadable(() => import('./AssignedForTranslator.jsx'), { fallback }),
  [TaskParty.Other]: loadable(() => import('./AssignedForOther.jsx'), { fallback }),
});
