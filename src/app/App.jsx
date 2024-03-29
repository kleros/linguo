import React from 'react';
import { hot } from 'react-hot-loader';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import theme from '~/features/ui/theme';
import MainRouter from './MainRouter';
import Web3Provider from '../context/Web3Provider';

function App() {
  return (
    <Web3Provider>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <MainRouter />
      </ThemeProvider>
    </Web3Provider>
  );
}

export default hot(module)(App);

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
