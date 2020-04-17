import React from 'react';
import styled from 'styled-components';
import { Radio, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { filters } from '~/api/linguo';
import * as r from '~/app/routes';
import RequiredWalletGateway from '~/components/RequiredWalletGateway';
import Button from '~/components/Button';
import RadioButton from '~/components/RadioButton';
import { AddIcon } from '~/components/icons';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskListFetcher from './TaskListFetcher';
import useFilter from './useFilter';

const StyledControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .actions {
    flex: auto 0 0;
  }

  .filters {
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

    .filters {
      margin-left: 0;
      margin-top: 2rem;
      width: 100%;
    }
  }

  @media (max-width: 575.98px) {
    padding: 1rem;
  }
`;

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

const StyledDivider = styled(Divider)`
  background: ${props => props.theme.primary.default};
  margin: 2.5rem 0;

  @media (max-width: 575.98px) {
    background: none;
    margin: 0 0 1rem;
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

function TranslationDashboard() {
  const [filter, setFilter] = useFilter();

  const handleFilterChange = React.useCallback(
    e => {
      const { value } = e.target;
      setFilter(value);
    },
    [setFilter]
  );

  return (
    <MultiCardLayout>
      <StyledControls>
        <div className="actions">
          <Link to={r.TRANSLATION_CREATION}>
            <Button variant="filled" icon={<AddIcon />}>
              New Translation
            </Button>
          </Link>
        </div>
        <div className="filters">
          <StyledRadioGroup onChange={handleFilterChange} value={filter}>
            {buttons.map(({ value, text }) => (
              <StyledRadioButton key={value} value={value}>
                {text}
              </StyledRadioButton>
            ))}
          </StyledRadioGroup>
        </div>
      </StyledControls>
      <StyledDivider />
      <RequiredWalletGateway message="To view your requested translation tasks you need an Ethereum wallet.">
        <TaskListFetcher />
      </RequiredWalletGateway>
    </MultiCardLayout>
  );
}

export default TranslationDashboard;
