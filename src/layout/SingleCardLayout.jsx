import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Layout } from 'antd';
import Card from '~/shared/Card';

export default function SingleCardLayout({ title, beforeContent, children, className }) {
  return (
    <StyledLayout>
      {beforeContent}
      <StyledCard title={title} className={className}>
        {children}
      </StyledCard>
    </StyledLayout>
  );
}

SingleCardLayout.propTypes = {
  title: t.node.isRequired,
  beforeContent: t.node,
  children: t.node,
  className: t.string,
};

SingleCardLayout.defaultProps = {
  beforeContent: null,
  children: null,
  className: '',
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
    box-shadow: 0 2px 2px ${props => props.theme.color.shadow.default};
    width: 100%;
  }

  .card-header-title {
    font-size: ${props => props.theme.fontSize.md};
    font-weight: ${props => props.theme.fontWeight.semibold};
    padding: 0;
  }

  .card-footer,
  .card-body {
    padding: 3rem;
  }

  && {
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
