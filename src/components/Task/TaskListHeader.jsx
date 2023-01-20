import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as r from '~/app/routes';
import TranslatorAvatar from '~/assets/images/avatar-work-as-a-translator.svg';
import Button from '~/shared/Button';

export default function TaskListHeader({ title, children }) {
  return (
    <StyledHeader>
      <StyledTitle>
        <TranslatorAvatar />
        {title}
      </StyledTitle>
      <StyledControls>
        {children}
        <div className="update-skills-button">
          <Link to={r.TRANSLATOR_SETTINGS} component={Button} fullWidth variant="filled">
            Update Skills
          </Link>
        </div>
      </StyledControls>
    </StyledHeader>
  );
}

TaskListHeader.propTypes = {
  title: t.string.isRequired,
  children: t.node,
};

const StyledHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 3rem;

  @media (max-width: 991.98px) {
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  @media (max-width: 575.98px) {
    padding: 1rem 1.5rem;
  }
`;

const StyledTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: ${p => p.theme.fontSize.md};
  font-weight: ${p => p.theme.fontWeight.regular};
  color: ${p => p.theme.color.primary.default};
  margin: 0 !important;

  > svg {
    width: 3rem;
    height: 3rem;
  }
`;

const StyledControls = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;

  > .update-skills-button {
    flex: 10rem 1 1;
    min-width: 8rem;
    max-width: 10rem;
  }

  @media (max-width: 767.98px) {
    justify-content: stretch;
    min-width: 100%;

    > .status-filter,
    > .update-skills-button {
      max-width: 100%;
    }
  }

  @media (max-width: 575.98px) {
    flex-wrap: wrap;

    > .update-skills-button {
      min-width: 100%;
      order: 0;
    }

    > .status-filter,
    > .ownership-filter {
      order: 1;
    }
  }
`;
