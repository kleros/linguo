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
const TranslatorMain = loadable(() => import('~/pages/TranslatorMain'), { fallback });
const TranslatorSetup = loadable(() => import('~/pages/TranslatorSetup'), { fallback });

function MainRouterSwitch() {
  return (
    <Switch>
      <Route exact path={r.HOME}>
        <Home />
      </Route>
      <Route exact path={r.TRANSLATOR_MAIN}>
        <TranslatorMain />
      </Route>
      <Route exact path={r.TRANSLATOR_SETUP}>
        <TranslatorSetup />
      </Route>
    </Switch>
  );
}

export default MainRouterSwitch;
