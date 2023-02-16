import 'normalize.css';
import React from 'react';
import { Titled } from 'react-titled';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { Spin } from '~/adapters/antd';
import store, { persistor } from './store';
import App from './app/App';

const loading = <Spin tip="Loading local data..." />;

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_ENDPOINT,
  environment: process.env.REACT_APP_CONTEXT,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

render(
  <Provider store={store}>
    <PersistGate loading={loading} persistor={persistor}>
      <Titled title={() => 'Linguo by Kleros'}>
        <App />
      </Titled>
    </PersistGate>
  </Provider>,
  document.querySelector('#root')
);
