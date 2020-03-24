import { hot } from 'react-hot-loader';
import React from 'react';
import t from 'prop-types';
import { HashRouter as Router } from 'react-router-dom';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { Layout } from 'antd';
import Web3 from 'web3';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { useInactiveListener } from '~/adapters/web3React';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import { DrawerMenu } from '~/components/Menu';
import MainRouterSwitch from './MainRouterSwitch';
import { useSettings, WEB3_PROVIDER } from './settings';
import { connectorsByName } from './connectors';
import theme from './theme';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 16px;
    color: ${props => props.theme.text.default};
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

function Web3ReactWrapper({ children }) {
  const { connector, activate } = useWeb3React();

  const [activatingConnector, setActivatingConnector] = React.useState();

  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  useInactiveListener(!!activatingConnector);

  const [{ allowEagerConnection, connectorName }] = useSettings(WEB3_PROVIDER);

  React.useEffect(() => {
    const savedConnector = connectorsByName[connectorName];
    if (allowEagerConnection && connectorName && savedConnector) {
      activate(savedConnector);
    }
  }, [allowEagerConnection, connectorName, activate]);

  return children;
}

Web3ReactWrapper.propTypes = {
  children: t.node,
};

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ReactWrapper>
        <ThemeProvider theme={theme}>
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
        </ThemeProvider>
      </Web3ReactWrapper>
    </Web3ReactProvider>
  );
}

export default hot(module)(App);
