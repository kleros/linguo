import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Layout } from 'antd';

const StyledLayout = styled(Layout)`
  margin: 4rem;
  max-width: 68rem;
  background: none;

  @media (max-width: 575.98px) {
    margin: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
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
