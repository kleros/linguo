import { hot } from 'react-hot-loader';
import React from 'react';
import t from 'prop-types';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import Web3 from 'web3';
import { Web3ReactProvider } from '@web3-react/core';
import { useWeb3ReactBootstrap, useWatchLibrary } from '~/features/web3';
import theme from '~/features/ui/theme';
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

function Initializer({ children }) {
  useWeb3ReactBootstrap();
  useWatchLibrary();

  return children;
}

Initializer.propTypes = {
  children: t.node,
};

function getLibrary(provider) {
  return new Web3(provider);
}

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
  }

  p {
    margin-bottom: 0;

    & + p {
      margin-top: 1rem;
    }
  }
`;
