import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import loadable from '@loadable/component';
import { Layout } from 'antd';
import { ConnectedRouter } from 'connected-react-router';
import { Alert, Spin } from '~/adapters/antd';
// import { selectPreference } from '~/features/ui/uiSlice';
import { getNetworkName, useSwitchToChainFromUrl } from '~/features/web3';
import { getCounterPartyChainId, isSupportedChain, isSupportedSideChain } from '~/features/web3/supportedChains';
import Web3ErrorAlert from '~/features/web3/Web3ErrorAlert';
import { selectChainId, switchChain } from '~/features/web3/web3Slice';
import { WarningIcon } from '~/shared/icons';
import Button from '~/shared/Button';
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

export default function MainRouter() {
  // const defaultPage = useSelector(selectPreference('page.default'));

  return (
    <ConnectedRouter history={history}>
      <RouterInitializer>
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
            <Content>
              <Switch>
                <Route exact path={r.ROOT}>
                  <Redirect to={r.HOME} />
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
      </RouterInitializer>
    </ConnectedRouter>
  );
}

function _RouterInitializer({ children }) {
  useSwitchToChainFromUrl();

  return children;
}

_RouterInitializer.propTypes = {
  children: t.node,
};

const RouterInitializer = React.memo(_RouterInitializer);

function GlobalWarnings() {
  const dispatch = useDispatch();
  const chainId = useSelector(selectChainId);
  const counterPartyChainId = getCounterPartyChainId(chainId);

  return (
    <div
      css={`
        position: relative;

        :empty {
          display: none;
        }

        @media (max-width: 991.98px) {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 767.98px) {
          margin-bottom: 1rem;
        }

        @media (max-width: 575.98px) {
          margin-bottom: 2.5rem;
        }
      `}
    >
      {chainId !== -1 && !isSupportedSideChain(chainId) && (
        <Alert
          banner
          type="warning"
          icon={<WarningIcon />}
          message={
            <>
              {isSupportedChain(chainId)
                ? 'Linguo is moving to a side-chain for more affordable gas prices:'
                : 'Network Not Supported.'}{' '}
              <Button variant="link" onClick={() => dispatch(switchChain({ chainId: counterPartyChainId ?? 100 }))}>
                Switch to {getNetworkName(counterPartyChainId ?? 100)}.
              </Button>
            </>
          }
          css={`
            position: absolute;
            z-index: 1;
            top: 0;
            left: 0;
            right: 0;
          `}
        />
      )}
    </div>
  );
}
