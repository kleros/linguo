import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Layout } from 'antd';
import Card from '~/components/Card';

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

const StyledCard = styled(Card)`
  &.ant-card {
    box-shadow: 0 0.375rem 5.625rem ${props => props.theme.shadow.default};
    width: 100%;
  }

  .ant-card-head-title {
    font-size: ${props => props.theme.fontSize.xl};
    padding: 0;
  }

  .ant-card-body {
    padding: 5rem;
  }

  && {
    @media (max-width: 575.98px) {
      flex: auto;
      box-shadow: none;
      border-radius: 0;

      .ant-card-head {
        border-radius: 0;
      }

      .ant-card-body {
        padding: 2rem;
      }
    }
  }
`;

function SingleCardLayout({ title, children }) {
  return (
    <StyledLayout>
      <StyledCard title={title}>{children}</StyledCard>
    </StyledLayout>
  );
}

SingleCardLayout.propTypes = {
  title: t.string.isRequired,
  children: t.node,
};

SingleCardLayout.defaultProps = {
  children: null,
};

export default SingleCardLayout;
