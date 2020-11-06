import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import loadable from '@loadable/component';
import { Layout } from 'antd';
import { ConnectedRouter } from 'connected-react-router';
import { Spin } from '~/adapters/antd';
import { selectPreference } from '~/features/ui/uiSlice';
import Web3ErrorAlert from '~/features/web3/Web3ErrorAlert';
import Footer from '~/shared/Footer';
import { DrawerMenu } from '~/shared/Menu';
import Navbar from '~/shared/Navbar';
import { history } from '~/store';
import Content from './Content';
import * as r from './routes';

const fallback = <Spin $centered tip="Loading page content..." />;

const Home = loadable(() => import('~/pages/Home'), { fallback });
const Faq = loadable(() => import('~/pages/Faq'), { fallback });
const TranslatorDashboard = loadable(() => import('~/pages/TranslatorDashboard'), { fallback });
const TranslatorSettings = loadable(async () => import('~/pages/TranslatorSettings'), { fallback });
const RequesterDashboard = loadable(() => import('~/pages/RequesterDashboard'), { fallback });
const TranslationRequest = loadable(() => import('~/pages/TranslationRequest'), { fallback });
const TranslationDetails = loadable(() => import('~/pages/TranslationDetails'), { fallback });

function MainRouter() {
  const defaultPage = useSelector(selectPreference('page.default'));

  return (
    <ConnectedRouter history={history}>
      <Layout>
        <DrawerMenu />
        <Layout>
          <Navbar />
          <Web3ErrorAlert />
          <Content>
            <Switch>
              <Route exact path={r.ROOT}>
                <Redirect to={defaultPage ?? r.HOME} />
              </Route>
              <Route exact path={r.HOME}>
                <Home />
              </Route>
              <Route exact path={r.FAQ}>
                <Faq />
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
              <Route exact path={r.REQUESTER_DASHBOARD}>
                <RequesterDashboard />
              </Route>
              <Route exact path={r.TRANSLATION_TASK_DETAILS}>
                <TranslationDetails />
              </Route>
            </Switch>
          </Content>
          <Footer />
        </Layout>
      </Layout>
    </ConnectedRouter>
  );
}

export default MainRouter;
