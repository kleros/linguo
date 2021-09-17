import React from 'react';
import loadable from '@loadable/component';
import { TaskParty } from '~/features/tasks';
import Spinner from '../../components/Spinner';
import withResolveComponentByParty from '../withResolveComponentByParty';

const fallback = <Spinner />;

export default withResolveComponentByParty({
  // eslint-disable-next-line import/extensions
  [TaskParty.Requester]: loadable(() => import('./IncompleteForRequester.jsx'), { fallback }),
  // eslint-disable-next-line import/extensions
  [TaskParty.Translator]: loadable(() => import('./IncompleteForTranslator.jsx'), { fallback }),
  // eslint-disable-next-line import/extensions
  [TaskParty.Other]: loadable(() => import('./IncompleteForOther.jsx'), { fallback }),
});
