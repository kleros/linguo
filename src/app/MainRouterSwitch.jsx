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

const fallback = <StyledSpin tip="Loading contents of the page" />;

const Home = loadable(() => import('~/pages/Home'), { fallback });
const TranslatorDashboard = loadable(() => import('~/pages/TranslatorDashboard'), { fallback });
const TranslatorSettings = loadable(() => import('~/pages/TranslatorSettings'), { fallback });
const TranslationDashboard = loadable(() => import('~/pages/TranslationDashboard'), { fallback });
const TranslationCreation = loadable(() => import('~/pages/TranslationCreation'), { fallback });
const TranslationTaskDetails = loadable(() => import('~/pages/TranslationTaskDetails'), { fallback });

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
      <Route exact path={r.TRANSLATION_CREATION}>
        <TranslationCreation />
      </Route>
      <Route exact path={r.TRANSLATION_DASHBOARD}>
        <TranslationDashboard />
      </Route>
      <Route exact path={r.TRANSLATION_TASK_DETAILS}>
        <TranslationTaskDetails />
      </Route>
    </Switch>
  );
}

export default MainRouterSwitch;
