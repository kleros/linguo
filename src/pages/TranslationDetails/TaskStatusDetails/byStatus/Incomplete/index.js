import React from 'react';
import loadable from '@loadable/component';
import { TaskParty } from '~/features/tasks';
import Spinner from '../../components/Spinner';
import withResolveComponentByParty from '../withResolveComponentByParty';

const fallback = <Spinner />;

export default withResolveComponentByParty({
  [TaskParty.Requester]: loadable(() => import('./IncompleteForRequester.jsx'), { fallback }),
  [TaskParty.Translator]: loadable(() => import('./IncompleteForTranslator.jsx'), { fallback }),
  [TaskParty.Other]: loadable(() => import('./IncompleteForOther.jsx'), { fallback }),
});
