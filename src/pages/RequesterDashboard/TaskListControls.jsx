import React from 'react';
import styled from 'styled-components';
import { Radio } from 'antd';
import { Link } from 'react-router-dom';
import * as r from '~/app/routes';
import Button from '~/components/Button';
import RadioButton from '~/components/RadioButton';
import { AddIcon } from '~/components/icons';
import filters, { useFilterName } from './filters';

function TaskListControls() {
  return (
    <StyledControls>
      <TaskListActions />
      <TaskListFilters />
    </StyledControls>
  );
}

export default TaskListControls;

function TaskListActions() {
  return (
    <StyledActions>
      <Link to={r.TRANSLATION_REQUEST}>
        <Button variant="filled" icon={<AddIcon />}>
          New Translation
        </Button>
      </Link>
    </StyledActions>
  );
}

function TaskListFilters() {
  const [filterName, setFilterName] = useFilterName();

  const handleFilterChange = React.useCallback(
    e => {
      const { value } = e.target;
      setFilterName(value);
    },
    [setFilterName]
  );

  return (
    <StyledFilters>
      <StyledRadioGroup onChange={handleFilterChange} value={filterName}>
        {buttons.map(({ value, text }) => (
          <StyledRadioButton key={value} value={value}>
            {text}
          </StyledRadioButton>
        ))}
      </StyledRadioGroup>
    </StyledFilters>
  );
}

const StyledActions = styled.div``;

const StyledFilters = styled.div``;

const StyledRadioGroup = styled(Radio.Group)`
  min-height: 0; /* NEW */
  min-width: 0; /* NEW; needed for Firefox */
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(6, 1fr);

  @media (max-width: 991.98px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 575.98px) {
    width: 100%;
    grid-gap: 0;
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StyledRadioButton = styled(RadioButton)`
  && {
    @media (max-width: 767.98px) {
      font-size: ${props => props.theme.fontSize.sm};
      height: 2.5rem;
      line-height: 2.5rem;
      border-radius: 1.25rem;
    }

    @media (max-width: 575.98px) {
      border-radius: 0;
      border-right-width: 0;
      height: 3rem;
      line-height: 3rem;

      :nth-child(3n) {
        border-right-width: 1px;
      }

      :nth-child(-n + 3) {
        border-bottom-width: 0;
      }

      :first-child {
        border-top-left-radius: 0.25rem;
      }

      :last-child {
        border-bottom-right-radius: 0.25rem;
      }

      :nth-last-child(3) {
        border-bottom-left-radius: 0.25rem;
      }
      :nth-child(3) {
        border-top-right-radius: 0.25rem;
      }
    }
  }
`;

const buttons = [
  {
    value: filters.open,
    text: 'Open Tasks',
  },
  {
    value: filters.inProgress,
    text: 'In Progress',
  },
  {
    value: filters.inReview,
    text: 'Review List',
  },
  {
    value: filters.inDispute,
    text: 'In Dispute',
  },
  {
    value: filters.finished,
    text: 'Finished',
  },
  {
    value: filters.incomplete,
    text: 'Incomplete',
  },
];

const StyledControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${StyledActions} {
    flex: auto 0 0;
  }

  ${StyledFilters} {
    flex: auto 0 1;
    margin-left: 2rem;
  }

  @media (max-width: 991.98px) {
    align-items: flex-start;
  }

  @media (max-width: 767.98px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    ${StyledFilters} {
      margin-left: 0;
      margin-top: 2rem;
      width: 100%;
    }
  }

  @media (max-width: 575.98px) {
    padding: 1.5rem;
  }
`;
