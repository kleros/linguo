import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ConnectedRouter } from 'connected-react-router';
import { Switch, Route } from 'react-router-dom';
import loadable from '@loadable/component';
import { Layout, Alert } from 'antd';
import { selectError, deactivate } from '~/features/web3/web3Slice';
import getErrorMessage from '~/features/web3/getErrorMessage';
import { Spin } from '~/adapters/antd';
import WalletConnectionButton from '~/components/WalletConnectionButton';
import Button from '~/components/Button';
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
          <Web3ErrorBanner />
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

function Web3ErrorBanner() {
  const dispatch = useDispatch();
  const web3Error = useSelector(selectError);

  const handleDisconnectClick = React.useCallback(
    evt => {
      evt.preventDefault();
      dispatch(deactivate());
    },
    [dispatch]
  );

  return web3Error ? (
    <Alert
      banner
      showIcon={false}
      type="warning"
      message={<>{getErrorMessage(web3Error)}</>}
      description={
        <>
          You could{' '}
          <Button variant="link" onClick={handleDisconnectClick}>
            use Linguo in read-only mode
          </Button>{' '}
          or try to <WalletConnectionButton variant="link">connect to a different wallet</WalletConnectionButton>.
        </>
      }
    />
  ) : null;
}

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
