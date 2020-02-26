import { hot } from 'react-hot-loader';
import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { Layout } from 'antd';
import Home from '~/pages/Home';
import TranslatorMain from '~/pages/TranslatorMain';
import TranslatorSetup from '~/pages/TranslatorSetup';
import * as r from '~/app/routes';
import Navbar from '~/app/Navbar';
import Footer from '~/app/Footer';
import { DrawerMenu } from '~/app/Menu';

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
    <Router>
      <GlobalStyle />
      <Layout>
        {DrawerMenu}
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
  );
}

export default hot(module)(App);
