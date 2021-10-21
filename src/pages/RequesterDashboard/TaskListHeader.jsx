import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import * as r from '~/app/routes';
import RequesterAvatar from '~/assets/images/avatar-request-translation.svg';
import { useFilters } from '~/features/requester';
import TaskStatusFilter from '~/features/tasks/TaskStatusFilter';
import Button from '~/shared/Button';

export default function TaskListHeader() {
  return (
    <StyledHeader>
      <StyledTitle>
        <RequesterAvatar />
        Requester
      </StyledTitle>
      <StyledControls>
        <div className="status-filter">
          <TaskStatusFilterContainer />
        </div>
        <div className="request-translation-button">
          <Link to={r.TRANSLATION_REQUEST} component={Button} fullWidth variant="filled">
            New Translation
          </Link>
        </div>
      </StyledControls>
    </StyledHeader>
  );
}

function TaskStatusFilterContainer() {
  const [{ status, allTasks }, setFilters] = useFilters();

  const handleFilterChange = React.useCallback(
    value => {
      setFilters({ status: value, allTasks });
    },
    [setFilters, allTasks]
  );

  return <TaskStatusFilter fullWidth value={status} onChange={handleFilterChange} />;
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

  > .status-filter {
    flex: 14rem 1 1;
    min-width: 8rem;
    max-width: 14rem;
  }

  > .request-translation-button {
    flex: 10rem 1 1;
    min-width: 8rem;
    max-width: 10rem;
  }

  @media (max-width: 767.98px) {
    justify-content: stretch;
    min-width: 100%;

    > .status-filter,
    > .request-translation-button {
      max-width: 100%;
    }
  }

  @media (max-width: 575.98px) {
    flex-wrap: wrap;

    > .request-translation-button {
      min-width: 100%;
      order: 0;
    }

    > .status-filter,
    > .ownership-filter {
      order: 1;
    }
  }
`;
