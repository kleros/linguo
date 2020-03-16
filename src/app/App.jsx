import { hot } from 'react-hot-loader';
import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { Layout, Spin } from 'antd';
import Home from '~/pages/Home';
import TranslatorMain from '~/pages/TranslatorMain';
import TranslatorSetup from '~/pages/TranslatorSetup';
import * as r from './routes';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import { DrawerMenu } from '~/components/Menu';
import { DrizzleProvider, Initializer } from '~/adapters/drizzle';
import drizzle from './setupDrizzle';
import theme from './theme';

const StyledSpin = styled(Spin)`
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 16px;
  }
`;

const StyledContent = styled(Layout.Content)`
  /* Must account for both navbar and footer height */
  min-height: calc(100vh - 4rem - 4rem);
  background-color: #f2fffe;
`;

function App() {
  return (
    <DrizzleProvider drizzle={drizzle}>
      <Initializer
        error="There was an error."
        loadingContractsAndAccounts={<StyledSpin tip="Reading information about your Web3 account and contracts" />}
        loadingWeb3={<StyledSpin tip="Connecting to your Web3 provider" />}
      >
        <ThemeProvider theme={theme}>
          <Router>
            <GlobalStyle />
            <Layout>
              <DrawerMenu />
              <Layout>
                <Navbar />
                <StyledContent>
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
                </StyledContent>
                <Footer />
              </Layout>
            </Layout>
          </Router>
        </ThemeProvider>
      </Initializer>
    </DrizzleProvider>
  );
}

export default hot(module)(App);
