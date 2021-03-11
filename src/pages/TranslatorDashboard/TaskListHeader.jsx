import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as r from '~/app/routes';
import TranslatorAvatar from '~/assets/images/avatar-work-as-a-translator.svg';
import TaskStatusFilter from '~/features/tasks/TaskStatusFilter';
import TaskOwnershipFilter from '~/features/translator/TaskOwnershipFilter';
import { statusFilters, useFilters } from '~/features/translator';
import Button from '~/shared/Button';

export default function TaskListHeader() {
  return (
    <StyledHeader>
      <StyledTitle>
        <TranslatorAvatar />
        Translator
      </StyledTitle>
      <StyledControls>
        <div className="ownership-filter">
          <TaskOwnershipFilterContainer />
        </div>
        <div className="status-filter">
          <TaskStatusFilterContainer />
        </div>
        <div className="update-skills-button">
          <Link to={r.TRANSLATOR_SETTINGS} component={Button} fullWidth variant="filled">
            Update Skills
          </Link>
        </div>
      </StyledControls>
    </StyledHeader>
  );
}

function TaskOwnershipFilterContainer() {
  const [{ status, allTasks }, setFilters] = useFilters();

  const handleFilterChange = React.useCallback(
    value => {
      setFilters({ status, allTasks: value });
    },
    [setFilters, status]
  );

  return status !== statusFilters.open ? (
    <TaskOwnershipFilter fullWidth value={allTasks} onChange={handleFilterChange} />
  ) : null;
}

function TaskStatusFilterContainer() {
  const [{ status, allTasks }, setFilters] = useFilters();

  const handleFilterChange = React.useCallback(
    value => {
      setFilters({ status: value, allTasks });
    },
    [setFilters, allTasks]
  );

  return <TaskStatusFilter fullWidth defaultValue={status} onChange={handleFilterChange} />;
}

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

  > .ownership-filter {
    flex: 8rem 0 0;
    min-width: 8rem;
    max-width: 8rem;

    :empty {
      display: none;
    }
  }

  > .status-filter {
    flex: 14rem 1 1;
    min-width: 8rem;
    max-width: 14rem;
  }

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
