import React from 'react';
import loadable from '@loadable/component';
import Spinner from '../../components/Spinner';

const fallback = <Spinner />;

// eslint-disable-next-line import/extensions
const Resolved = loadable(() => import('./Resolved.jsx'), { fallback });

export default Resolved;
