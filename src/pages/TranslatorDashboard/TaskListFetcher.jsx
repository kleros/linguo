import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Badge, Tabs } from 'antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import * as r from '~/app/routes';
import TaskList from '~/features/translator/TaskList';
import { filters, hasSecondLevelFilters, secondLevelFilters, useFilters } from '~/features/translator';
import {
  fetchTasks,
  selectTaskCountForFilter,
  selectTasksForCurrentFilter,
  selectAllSkills,
} from '~/features/translator/translatorSlice';
import DismissableAlert from '~/features/ui/DismissableAlert';
import { selectAccount } from '~/features/web3/web3Slice';

export default function TaskListFetcher() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const skills = useShallowEqualSelector(selectAllSkills);

  const doFetchTasks = React.useCallback(() => {
    dispatch(fetchTasks({ account }));
  }, [dispatch, account]);

  React.useEffect(() => {
    doFetchTasks();
  }, [doFetchTasks]);

  const [{ filter, secondLevelFilter }] = useFilters();

  const data = useShallowEqualSelector(state => selectTasksForCurrentFilter(state, { account, skills }));
  const showFootnote = [filters.open].includes(filter) && data.length > 0;

  return (
    <OptionalSecondLevelTabs>
      {filterDescriptionMap[secondLevelFilter ?? filter]}
      <TaskList data={data} showFootnote={showFootnote} />
    </OptionalSecondLevelTabs>
  );
}

const StyledDismissableAlert = styled(DismissableAlert)`
  margin-bottom: 1rem;

  p + p {
    margin-top: 0;
  }
`;

const filterDescriptionMap = {
  [filters.open]: (
    <StyledDismissableAlert
      id="translator.filters.open"
      message="You will only be able to see tasks whose both source and target languages you have self-declared level B2 or higher."
      description={
        <>
          Learn more about this in our{' '}
          <Link
            to={{
              pathname: r.FAQ,
              hash: '#how-does-my-skill-levels-affect-the-amount-of-tasks-i-will-be-able-to-work-on-as-a-translator',
            }}
          >
            FAQ
          </Link>
          .
        </>
      }
    />
  ),
  [filters.inProgress]: (
    <StyledDismissableAlert
      id="translator.filters.inProgress"
      message="You are currently working on the translations below."
    />
  ),
  [secondLevelFilters[filters.inReview].myTranslations]: (
    <StyledDismissableAlert
      id="translator.filters.inReview.myTranslations"
      message="You already delivered the translations below."
      description={
        <>
          <p>
            They will be under review for some time to allow other translators to evaluate the quality of the work done.
          </p>
          <p>If there are issues with the translation, anyone can raise a challenge against them.</p>
        </>
      }
    />
  ),
  [secondLevelFilters[filters.inReview].toReview]: (
    <StyledDismissableAlert
      id="translator.filters.inReview.toReview"
      message="Other translators delivered completed the translation tasks below."
      description={
        <>
          <p>If you think there are issues with any of them, you can raise a challenge.</p>
          <p>
            When there is a challenge, specialized jurors on the Kleros court will judge if the translation does or does
            not comply with the requirements.
          </p>
          <p>
            If they decide to reject the translation, you can receive the Translator Deposit as - Arbitration Fees a
            reward.
          </p>
        </>
      }
    />
  ),
  [filters.finished]: (
    <StyledDismissableAlert
      id="translator.filters.incomplete"
      message="The finished translation tasks you participated in are shown below."
      description={
        <p>You will see them regardless they were accepted or, in case there were a dispute, rejected by a jury.</p>
      }
    />
  ),
  [filters.incomplete]: (
    <StyledDismissableAlert
      id="translator.filters.incomplete"
      message="You were assigned to the tasks below but were not able to deliver the translation within the deadline."
    />
  ),
};

function OptionalSecondLevelTabs({ children }) {
  const [{ filter, secondLevelFilter }, setFilters] = useFilters();

  const handleTabChange = React.useCallback(
    key => {
      setFilters({ filter, secondLevelFilter: key });
    },
    [setFilters, filter]
  );

  if (!hasSecondLevelFilters(filter)) {
    return children;
  }

  const filters = secondLevelFilters[filter];
  return (
    <StyledTabs animated={false} activeKey={secondLevelFilter} onChange={handleTabChange}>
      {Object.values(filters).map(secondLevelFilterName => {
        return (
          <StyledTabPane
            key={secondLevelFilterName}
            tab={<FilterTab filter={filter} secondLevelFilter={secondLevelFilterName} />}
          >
            {children}
          </StyledTabPane>
        );
      })}
    </StyledTabs>
  );
}

OptionalSecondLevelTabs.propTypes = {
  children: t.oneOfType([t.node, t.arrayOf(t.node)]),
};

OptionalSecondLevelTabs.defaultProps = {
  children: null,
};

function FilterTab({ filter, secondLevelFilter }) {
  const account = useSelector(selectAccount);
  const skills = useShallowEqualSelector(selectAllSkills);
  const count = useSelector(state => selectTaskCountForFilter(state, { filter, secondLevelFilter, account, skills }));

  const tabContent = secondLevelFiltersDisplayNames[filter]?.[secondLevelFilter] ?? secondLevelFilter;

  return <StyledBadge count={count}>{tabContent}</StyledBadge>;
}

FilterTab.propTypes = {
  filter: t.string.isRequired,
  secondLevelFilter: t.string,
};

const secondLevelFiltersDisplayNames = {
  [filters.inReview]: {
    toReview: 'To Review',
    myTranslations: 'My Translations',
  },
};

const StyledTabs = styled(Tabs)`
  && {
    margin-top: -2rem;
    overflow: visible;

    .ant-tabs-tab,
    .ant-tabs-tab-active,
    .ant-tabs-tab:hover {
      font-weight: ${p => p.theme.fontWeight.medium};
    }

    .ant-tabs-tab-active,
    .ant-tabs-tab:hover {
      color: ${p => p.theme.color.primary.default};
    }

    .ant-tabs-nav::before {
      border-bottom-color: transparent;
    }

    .ant-tabs-ink-bar {
      background-color: ${p => p.theme.color.primary.default};
    }

    .ant-tabs-top-content > .ant-tabs-tabpane {
      transition: none;
    }
  }
`;

const StyledTabPane = styled(Tabs.TabPane)``;

const StyledBadge = styled(Badge)`
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
        font-weight: ${p => p.theme.fontWeight.medium};
        height: 0.875rem;
      }
    }
  }
`;
