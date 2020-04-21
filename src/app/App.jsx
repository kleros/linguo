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
import { useSettings, WEB3_PROVIDER } from './settings';
import { useWeb3React, useEagerConnection, useInactiveListener } from './web3React';
import { useSyncArchonProvider } from './archon';
import { connectorsByName } from './connectors';
import theme from './theme';

const GlobalStyle = createGlobalStyle`
  body {
    min-width: 24rem;
    overflow: auto;
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 16px;
    color: ${props => props.theme.color.text.default};
  }

  body > img[src*=fortmatic] {
    display: none;
  }

  a {
    color: ${p => p.theme.color.link.default};
    transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
  }

  a:hover,
  a:active,
  a:focus {
    color: ${p => p.theme.color.link.highlight};
    text-decoration: underline;
    text-decoration-skip-ink: auto;
  }
`;

const StyledContent = styled(Layout.Content)`
  height: 100%;
  /* Must account for both navbar and footer height */
  min-height: calc(100vh - 4rem - 4rem);
  background-color: ${p => p.theme.color.background.default};
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

function Initializer({ children }) {
  const [{ allowEagerConnection, connectorName }] = useSettings(WEB3_PROVIDER);
  const savedConnector = connectorsByName[connectorName];
  useEagerConnection({ skip: !allowEagerConnection, connector: savedConnector });

  const { activatingConnector, library: web3 } = useWeb3React();

  useInactiveListener({ suppress: !!activatingConnector });

  const provider = web3?.currentProvider;

  useSyncArchonProvider({ provider });

  return children;
}

Initializer.propTypes = {
  children: t.node,
};

function getLibrary(provider) {
  return new Web3(provider);
}

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
