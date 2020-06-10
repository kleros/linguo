import 'normalize.css';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Spin } from '~/adapters/antd';
import store, { persistor } from './store';
import App from './app/App';

const loading = <Spin $centered tip="Loading contents of the page..." />;

render(
  <Provider store={store}>
    <PersistGate loading={loading} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.querySelector('#root')
);
