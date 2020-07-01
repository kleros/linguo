import React from 'react';
import loadable from '@loadable/component';
import { TaskParty } from '~/features/tasks';
import Spinner from '../../components/Spinner';
import withResolveComponentByParty from '../withResolveComponentByParty';

const fallback = <Spinner />;

export default withResolveComponentByParty({
  [TaskParty.Requester]: loadable(() => import('./AwaitingReviewForRequester.jsx'), { fallback }),
  [TaskParty.Translator]: loadable(() => import('./AwaitingReviewForTranslator.jsx'), { fallback }),
  [TaskParty.Other]: loadable(() => import('./AwaitingReviewForOther.jsx'), { fallback }),
});
