import React from 'react';
import styled from 'styled-components';
import { ConnectedRouter } from 'connected-react-router';
import { Switch, Route } from 'react-router-dom';
import loadable from '@loadable/component';
import { Layout } from 'antd';
import { Spin } from '~/adapters/antd';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import { DrawerMenu } from '~/components/Menu';
import { history } from '~/store';
import * as r from './routes';

const fallback = <Spin $centered tip="Loading contents of the page..." />;

const Home = loadable(() => import('~/pages/Home'), { fallback });
const TranslatorDashboard = loadable(() => import('~/pages/TranslatorDashboard'), { fallback });
const TranslatorSettings = loadable(async () => import('~/pages/TranslatorSettings'), { fallback });
const RequesterDashboard = loadable(() => import('~/pages/RequesterDashboard'), { fallback });
const TranslationRequest = loadable(() => import('~/pages/TranslationRequest'), { fallback });
const TranslationDetails = loadable(() => import('~/pages/TranslationDetails'), { fallback });

function MainRouter() {
  return (
    <ConnectedRouter history={history}>
      <Layout>
        <DrawerMenu />
        <Layout>
          <Navbar />
          <StyledContent>
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
          </StyledContent>
          <Footer />
        </Layout>
      </Layout>
    </ConnectedRouter>
  );
}

export default MainRouter;

const StyledContent = styled(Layout.Content)`
  height: 100%;
  /* Must account for both navbar and footer height */
  min-height: calc(100vh - 4rem - 4rem);
  background-color: ${p => p.theme.color.background.default};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
`;
