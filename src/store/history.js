import { createBrowserHistory } from 'history';
import { Route } from 'react-router-dom';
import * as Sentry from '@sentry/react';

export const SentryRoute = Sentry.withSentryRouting(Route);

const history = createBrowserHistory();
export default history;
