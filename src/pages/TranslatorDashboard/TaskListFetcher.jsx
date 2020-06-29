import React from 'react';
import { Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useShallowEqualSelector } from '~/adapters/reactRedux';
import { useRefreshEffectOnce } from '~/adapters/reactRouterDom';
import { InfoIcon } from '~/components/icons';
import TaskList from '~/features/tasks/TaskList';
import { fetchTasks, selectTasks } from '~/features/translator/translatorSlice';
import { selectAccount } from '~/features/web3/web3Slice';
import TaskListWithSecondLevelFilters from './TaskListWithSecondLevelFilters';
import filters, { getFilter, useFilterName } from './filters';
import { getComparator } from './sorting';

export default function TaskListFetcher() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);

  const doFetchTasks = React.useCallback(() => {
    dispatch(fetchTasks({ account }));
  }, [dispatch, account]);

  React.useEffect(() => {
    doFetchTasks();
  }, [doFetchTasks]);

  useRefreshEffectOnce(doFetchTasks);

  const [filterName] = useFilterName();

  const data = useShallowEqualSelector(selectTasks(account));
  const displayableData = React.useMemo(
    () => sort(filter(data, getFilter(filterName)), getComparator(filterName, { account })),
    [data, filterName, account]
  );
  const showFootnote = [filters.open].includes(filterName) && displayableData.length > 0;
  const showFilterDescription = displayableData.length > 0;

  return (
    <>
      {showFilterDescription && filterDescriptionMap[filterName]}

      <TaskListWithSecondLevelFilters filterName={filterName} data={displayableData} account={account}>
        {({ data }) => <TaskList data={data} showFootnote={showFootnote} />}
      </TaskListWithSecondLevelFilters>
    </>
  );
}

const filterDescriptionMap = {
  [filters.incomplete]: (
    <Alert
      showIcon
      css={`
        margin-bottom: 1rem;
      `}
      icon={<InfoIcon />}
      type="info"
      message="Incomplete taks are those which were not assigned to any translator or whose translator did not submit the translated text within the specified deadline."
    />
  ),
};

const sort = (data, comparator) => [...data].sort(comparator);
const filter = (data, predicate) => data.filter(predicate);
