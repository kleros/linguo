import React from 'react';
import loadable from '@loadable/component';
import Spinner from '../../components/Spinner';

const fallback = <Spinner />;

const Resolved = loadable(() => import('./Resolved.jsx'), { fallback });

export default Resolved;
