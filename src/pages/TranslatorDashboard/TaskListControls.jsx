import React from 'react';
import t from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Badge, Radio } from 'antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import * as r from '~/app/routes';
import { filters, useFilters } from '~/features/translator';
import { selectTaskCountForFilter, selectAllSkills } from '~/features/translator/translatorSlice';
import { selectAccount } from '~/features/web3/web3Slice';
import Button from '~/shared/Button';
import RadioButton from '~/shared/RadioButton';

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
      <Link to={r.TRANSLATOR_SETTINGS}>
        <Button variant="filled">Update Skills</Button>
      </Link>
    </StyledActions>
  );
}

function TaskListFilters() {
  const [{ filter }, setFilters] = useFilters();

  const handleFilterChange = React.useCallback(
    e => {
      setFilters({ filter: e.target.value });
    },
    [setFilters]
  );

  return (
    <StyledFilters>
      <StyledRadioGroup onChange={handleFilterChange} value={filter}>
        {buttons.map(({ value, text }) => (
          <FilterOption key={value} value={value} text={text} />
        ))}
      </StyledRadioGroup>
    </StyledFilters>
  );
}

function FilterOption({ value, text }) {
  const account = useSelector(selectAccount);
  const skills = useShallowEqualSelector(selectAllSkills);
  const count = useSelector(state =>
    selectTaskCountForFilter(state, {
      account,
      skills,
      filter: value,
    })
  );

  return (
    <StyledRadioButton key={value} value={value}>
      <StyledBadge count={count}>{text}</StyledBadge>
    </StyledRadioButton>
  );
}

FilterOption.propTypes = {
  value: t.string.isRequired,
  text: t.string.isRequired,
};

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
    overflow: visible;
    font-weight: ${props => props.theme.fontWeight.semibold};

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
    text: 'Open',
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

const StyledBadge = styled(Badge)`
  width: 100%;

  .ant-scroll-number {
    font-size: ${p => p.theme.fontSize.xxs};
    padding: 0;
    min-width: 0.875rem;
    height: 0.875rem;
    line-height: 0.875rem;
    right: -0.375rem;
    border: none;
    box-shadow: none;
    background-color: ${p => p.theme.color.secondary.default};

    > .ant-scroll-number-only {
      &,
      > .ant-scroll-number-only-unit {
        font-weight: ${p => p.theme.fontWeight.semibold};
        height: 0.875rem;
      }
    }
  }
`;
