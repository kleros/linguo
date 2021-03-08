import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import styled from 'styled-components';

export default function Card({ title, titleLevel, footer, children, className }) {
  const TitleTag = `h${titleLevel}`;
  return (
    <StyledWrapper className={clsx('card', className)}>
      <header className="card-header">
        <TitleTag className="card-header-title">{title}</TitleTag>
      </header>
      <main className="card-body">{children}</main>
      {footer && <footer className="card-footer">{footer}</footer>}
    </StyledWrapper>
  );
}

Card.propTypes = {
  title: t.node.isRequired,
  titleLevel: t.oneOf([1, 2, 3, 4, 5, 6]),
  footer: t.node,
  children: t.node,
  className: t.node,
};

Card.defaultProps = {
  titleLevel: 1,
  footer: null,
  children: null,
  className: '',
};

const StyledWrapper = styled.section`
  display: flex;
  flex-flow: column nowrap;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 3px ${props => props.theme.color.shadow.default};
  font-size: 1rem;
  color: ${props => props.theme.color.text.default};
  background: ${props => props.theme.color.background.light};

  .card-header {
    background-color: ${props => props.theme.color.primary.default};
    color: ${props => props.theme.color.text.inverted};
    border: none;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    flex: 3rem 0 0;
    max-height: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem 1.25rem;
  }

  .card-header-title {
    text-align: center;
    font-size: ${props => props.theme.fontSize.md};
    font-weight: ${props => props.theme.fontWeight.semibold};
    color: ${props => props.theme.color.text.inverted};
    width: 100%;
    margin: 0;
  }

  .card-body {
    padding: 1rem 1.25rem;
    flex: 1;
  }

  .card-footer {
    margin-top: auto;
    padding: 0 1.25rem 1rem;
    background-color: ${props => props.theme.color.background.default};
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }
`;
