import React from 'react';
import loadable from '@loadable/component';
import { TaskParty } from '~/features/tasks';
import Spinner from '../../components/Spinner';
import withResolveComponentByParty from '../withResolveComponentByParty';

const fallback = <Spinner />;

export default withResolveComponentByParty({
  [TaskParty.Requester]: loadable(() => import('./CreatedForRequester.jsx'), { fallback }),
  [TaskParty.Other]: loadable(() => import('./CreatedForOther.jsx'), { fallback }),
});
