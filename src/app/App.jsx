import { hot } from 'react-hot-loader';
import React from 'react';
import t from 'prop-types';
import { HashRouter as Router } from 'react-router-dom';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { Layout } from 'antd';
import Web3 from 'web3';
import { Web3ReactProvider } from '@web3-react/core';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import { DrawerMenu } from '~/components/Menu';
import MainRouterSwitch from './MainRouterSwitch';
import { AppContextProvider } from './AppContext';
import { useWeb3React, useEagerConnection, useInactiveListener } from './web3React';
import { useSettings, WEB3_PROVIDER } from './settings';
import { useSyncArchonProvider } from './archon';
import { connectorsByName } from './connectors';
import theme from './theme';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 16px;
    color: ${props => props.theme.text.default};
  }

  body > img[src*=fortmatic] {
    display: none;
  }
`;

const StyledContent = styled(Layout.Content)`
  height: 100%;
  /* Must account for both navbar and footer height */
  min-height: calc(100vh - 4rem - 4rem);
  background-color: #f2fffe;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function getLibrary(provider) {
  return new Web3(provider);
}

function Initializer({ children }) {
  const [{ allowEagerConnection, connectorName }] = useSettings(WEB3_PROVIDER);
  const savedConnector = connectorsByName[connectorName];
  useEagerConnection({ skip: !allowEagerConnection, connector: savedConnector });

  const { activatingConnector, library } = useWeb3React();

  useInactiveListener(!!activatingConnector);

  useSyncArchonProvider(library);

  return children;
}

Initializer.propTypes = {
  children: t.node,
};

function App() {
  return (
    <AppContextProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <ThemeProvider theme={theme}>
          <Initializer>
            <GlobalStyle />
            <Router>
              <Layout>
                <DrawerMenu />
                <Layout>
                  <Navbar />
                  <StyledContent>
                    <MainRouterSwitch />
                  </StyledContent>
                  <Footer />
                </Layout>
              </Layout>
            </Router>
          </Initializer>
        </ThemeProvider>
      </Web3ReactProvider>
    </AppContextProvider>
  );
}

export default hot(module)(App);
