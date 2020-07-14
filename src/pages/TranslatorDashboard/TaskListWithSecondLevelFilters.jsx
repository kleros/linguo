import React from 'react';
import t from 'prop-types';
import { Tabs } from 'antd';
import styled from 'styled-components';
import filters from './filters';
import secondLevelFilters, { getSecondLevelFilter, hasSecondLevelFilters } from './secondLevelFilters';
import { getComparator } from './sorting';

export default function TaskListWithSecondLevelFilters({ data, filterName, account, children }) {
  if (!hasSecondLevelFilters(filterName)) {
    return children({ data });
  }

  const filters = secondLevelFilters[filterName];
  return (
    <StyledTabs animated={false}>
      {Object.values(filters).map(secondLevelFilterName => {
        const displayableData = sort(
          filter(data, getSecondLevelFilter(filterName, secondLevelFilterName, { account })),
          getComparator(filterName, { account })
        );

        const tabContent = secondLevelFiltersDisplayNames[filterName]?.[secondLevelFilterName] ?? secondLevelFilterName;

        return (
          <StyledTabPane key={secondLevelFilterName} tab={tabContent}>
            {children({ data: displayableData })}
          </StyledTabPane>
        );
      })}
    </StyledTabs>
  );
}

TaskListWithSecondLevelFilters.propTypes = {
  data: t.arrayOf(t.object).isRequired,
  filterName: t.oneOf(Object.values(filters)).isRequired,
  account: t.string,
  children: t.func.isRequired,
};

TaskListWithSecondLevelFilters.defaultProps = {
  account: null,
};

const sort = (data, comparator) => [...data].sort(comparator);
const filter = (data, predicate) => data.filter(predicate);

const secondLevelFiltersDisplayNames = {
  [filters.inReview]: {
    toReview: 'To Review',
    myTranslations: 'My Translations',
  },
};

const StyledTabs = styled(Tabs)`
  && {
    margin-top: -2rem;
    .ant-tabs-tab,
    .ant-tabs-tab-active,
    .ant-tabs-tab:hover {
      font-weight: 500;
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
