import React from 'react';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import { Spin } from 'antd';
import loadable from '@loadable/component';
import * as r from './routes';

const StyledSpin = styled(Spin)`
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const fallback = <StyledSpin tip="Loading contents of the page..." />;

const Home = loadable(() => import('~/pages/Home'), { fallback });
const TranslatorDashboard = loadable(() => import('~/pages/TranslatorDashboard'), { fallback });
const TranslatorSettings = loadable(() => import('~/pages/TranslatorSettings'), { fallback });
const RequesterDashboard = loadable(() => import('~/pages/RequesterDashboard'), { fallback });
const TranslationRequest = loadable(() => import('~/pages/TranslationRequest'), { fallback });
const TranslationDetails = loadable(() => import('~/pages/TranslationDetails'), { fallback });

function MainRouterSwitch() {
  return (
    <Switch>
      <Route exact path={r.HOME}>
        <Home />
      </Route>
      <Route exact path={r.TRANSLATOR_DASHBOARD}>
        <TranslatorDashboard />
      </Route>
      <Route exact path={r.TRANSLATOR_SETTINGS}>
        <TranslatorSettings />
      </Route>
      <Route exact path={r.TRANSLATION_REQUEST}>
        <TranslationRequest />
      </Route>
      <Route exact path={r.TRANSLATION_DASHBOARD}>
        <RequesterDashboard />
      </Route>
      <Route exact path={r.TRANSLATION_TASK_DETAILS}>
        <TranslationDetails />
      </Route>
    </Switch>
  );
}

export default MainRouterSwitch;
