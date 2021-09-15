import React from 'react';
import { hot } from 'react-hot-loader';
import t from 'prop-types';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';
import theme from '~/features/ui/theme';
import { useWatchLibrary, useWeb3ReactBootstrap } from '~/features/web3';
import MainRouter from './MainRouter';

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ThemeProvider theme={theme}>
        <Initializer>
          <GlobalStyle />
          <MainRouter />
        </Initializer>
      </ThemeProvider>
    </Web3ReactProvider>
  );
}

export default hot(module)(App);

function _Initializer({ children }) {
  useWeb3ReactBootstrap();
  useWatchLibrary();

  return children;
}

_Initializer.propTypes = {
  children: t.node,
};

const Initializer = React.memo(_Initializer);

function getLibrary(provider) {
  return new Web3(provider);
}

const GlobalStyle = createGlobalStyle`
  body {
    min-width: 24rem;
    overflow: auto;
    font-family: 'Open Sans', sans-serif;
    font-weight: ${p => p.theme.fontWeight.regular};
    font-size: 16px;
    color: ${props => props.theme.color.text.default};
  }

  body > iframe[src*="3box"] {
    display: none !important;
  }

  a {
    color: ${p => p.theme.color.link.default};
    transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
  }

  a:hover,
  a:active,
  a:focus {
    color: ${p => p.theme.color.link.highlight};
  }

  p {
    margin-bottom: 0;

    & + p {
      margin-top: 1rem;
    }
  }
`;
