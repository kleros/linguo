import React from 'react';
import loadable from '@loadable/component';
import { TaskParty } from '~/app/linguo';
import Spinner from '../../components/Spinner';

const fallback = <Spinner />;
const Component = loadable(() => import('./Resolved.jsx'), { fallback });

export default {
  [TaskParty.Requester]: Component,
  [TaskParty.Translator]: Component,
  [TaskParty.Challenger]: Component,
  [TaskParty.Other]: Component,
};
