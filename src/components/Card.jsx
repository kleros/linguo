import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import styled from 'styled-components';

const StyledWrapper = styled.section`
  display: flex;
  flex-flow: column nowrap;
  border: none;
  border-radius: 0.625rem;
  box-shadow: 0 0.375rem 2rem ${props => props.theme.color.shadow.default};
  font-size: 1rem;
  color: ${props => props.theme.color.text.default};
  background: ${props => props.theme.color.background.light};

  .card-header {
    background-color: ${props => props.theme.color.primary.default};
    color: ${props => props.theme.color.text.inverted};
    border: none;
    border-top-left-radius: 0.625rem;
    border-top-right-radius: 0.625rem;
    flex: 3.75rem 0 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem 1.5rem;
  }

  .card-header-title {
    text-align: center;
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.color.text.inverted};
    width: 100%;
    margin: 0;
  }

  .card-body {
    padding: 1.5rem;
    flex: 1;
  }

  .card-footer {
    margin-top: auto;
    padding: 1.5rem;
    background-color: ${props => props.theme.color.background.default};
    border-bottom-left-radius: 0.625rem;
    border-bottom-right-radius: 0.625rem;
  }
`;

function Card({ title, titleLevel, footer, children, className }) {
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

export default Card;
