import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Layout } from 'antd';

const StyledLayout = styled(Layout)`
  margin: 4rem auto;
  padding: 0 4rem;
  max-width: 76rem;
  background: none;

  @media (max-width: 76rem) {
    max-width: 100%;
  }

  @media (max-width: 575.98px) {
    margin: 0;
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;

    && {
      .card {
        box-shadow: none;
      }

      .card,
      .card-footer,
      .card-header {
        border-radius: 0;
      }

      .card-footer,
      .card-body {
        padding: 1.5rem;
      }

      .card-header {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }
  }
`;

function MultiCardLayout({ children }) {
  return <StyledLayout>{children}</StyledLayout>;
}

MultiCardLayout.propTypes = {
  children: t.node,
};

MultiCardLayout.defaultProps = {
  children: null,
};

export default MultiCardLayout;
