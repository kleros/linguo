import React from 'react';
import { SWRConfig } from 'swr';
import { request } from 'graphql-request';
import * as dotenv from 'dotenv';

import { Redirect, Switch } from 'react-router-dom';
import loadable from '@loadable/component';
import { Layout } from 'antd';
import { ConnectedRouter } from 'connected-react-router';
import { Spin } from '~/adapters/antd';
import * as r from './routes';

import Web3ErrorAlert from '~/components/Web3ErrorAlert';

import Footer from '~/layout/Footer';
import Navbar from '~/layout/Header/Navbar';
import { DrawerMenu } from '~/layout/Header/Menu';

import { history, SentryRoute } from '~/store';
import Content from './Content';
import Web3ConnectionManager from '~/components/Web3ConnectionManager';
import GlobalWarnings from '~/components/GlobalWarnings';
import TranslatorSkillsProvider from '~/context/TranslatorSkillsProvider';
import { useWeb3 } from '~/hooks/useWeb3';
dotenv.config();

const fallback = <Spin $centered tip="Loading page content..." />;

const Home = loadable(() => import('~/pages/Home'), { fallback });
const Faq = loadable(() => import('~/pages/Faq'), { fallback });
const TranslatorDashboard = loadable(() => import('~/pages/TranslatorDashboard'), { fallback });
const TranslatorSettings = loadable(async () => import('~/pages/TranslatorSettings'), { fallback });
const RequesterDashboard = loadable(() => import('~/pages/RequesterDashboard'), { fallback });
const TranslationRequest = loadable(() => import('~/pages/TranslationRequest'), { fallback });
const TranslationDetails = loadable(() => import('~/pages/TranslationDetails'), { fallback });

const SUBGRAPH_NAMES = JSON.parse(process.env.SUBGRAPH_PROJECT_NAMES);
const fetcherBuilder =
  url =>
  ({ query, variables }) => {
    return request(url, query, variables);
  };

export default function MainRouter() {
  const { chainId } = useWeb3();

  return (
    <SWRConfig
      value={{ fetcher: fetcherBuilder(`https://api.thegraph.com/subgraphs/name/${SUBGRAPH_NAMES[chainId]}`) }}
    >
      <ConnectedRouter history={history}>
        <Web3ConnectionManager>
          <Layout>
            <DrawerMenu />
            <Layout
              css={`
                background-color: ${p => p.theme.color.background.default};
              `}
            >
              <Navbar />
              <div
                id="top-loading-bar"
                css={`
                  position: relative;
                `}
              ></div>
              <GlobalWarnings />
              <Web3ErrorAlert />
              <TranslatorSkillsProvider>
                <Content>
                  <Switch>
                    <SentryRoute exact path={r.ROOT}>
                      <Redirect to={r.HOME} />
                    </SentryRoute>
                    <SentryRoute exact path={r.HOME}>
                      <Home />
                    </SentryRoute>
                    <SentryRoute exact path={r.FAQ}>
                      <Faq />
                    </SentryRoute>
                    <SentryRoute exact path={r.TRANSLATOR_DASHBOARD}>
                      <TranslatorDashboard />
                    </SentryRoute>
                    <SentryRoute exact path={r.TRANSLATOR_SETTINGS}>
                      <TranslatorSettings />
                    </SentryRoute>
                    <SentryRoute exact path={r.TRANSLATION_REQUEST}>
                      <TranslationRequest />
                    </SentryRoute>
                    <SentryRoute exact path={r.REQUESTER_DASHBOARD}>
                      <RequesterDashboard />
                    </SentryRoute>
                    <SentryRoute exact path={r.TRANSLATION_TASK_DETAILS}>
                      <TranslationDetails />
                    </SentryRoute>
                  </Switch>
                </Content>
              </TranslatorSkillsProvider>
              <Footer />
            </Layout>
          </Layout>
        </Web3ConnectionManager>
      </ConnectedRouter>
    </SWRConfig>
  );
}
