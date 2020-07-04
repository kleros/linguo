import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Layout } from 'antd';
import Card from '~/shared/Card';

export default function SingleCardLayout({ title, beforeContent, children }) {
  return (
    <StyledLayout>
      {beforeContent}
      <StyledCard title={title}>{children}</StyledCard>
    </StyledLayout>
  );
}

SingleCardLayout.propTypes = {
  title: t.node.isRequired,
  beforeContent: t.node,
  children: t.node,
};

SingleCardLayout.defaultProps = {
  beforeContent: null,
  children: null,
};

const StyledLayout = styled(Layout)`
  margin: 4rem;
  max-width: 68rem;
  min-width: 0;
  background: none;
  // Makes the card to ocuppy all parent's height
  align-self: stretch;

  @media (max-width: 575.98px) {
    margin: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
  }
`;

const StyledCard = styled(Card)`
  && {
    min-height: 100%;
  }

  &.card {
    box-shadow: 0 0.375rem 5.625rem ${props => props.theme.color.shadow.default};
    width: 100%;
  }

  .card-header-title {
    font-size: ${props => props.theme.fontSize.xxl};
    padding: 0;
  }

  .card-body {
    padding: 5rem;
  }

  && {
    @media (max-width: 767.98px) {
      .card-footer,
      .card-body {
        padding: 3rem;
      }
    }

    @media (max-width: 575.98px) {
      flex: auto;
      box-shadow: none;
      border-radius: 0;

      &.card,
      .card-footer,
      .card-header {
        border-radius: 0;
      }

      .card-footer,
      .card-body {
        padding: 2rem;
      }
    }
  }
`;
