import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { useRefreshEffectOnce } from '~/adapters/react-router-dom';
import TaskList from '~/features/tasks/TaskList';
import { fetchTasks, selectTasks } from '~/features/translator/translatorSlice';
import DismissableAlert from '~/features/ui/DismissableAlert';
import { selectAccount } from '~/features/web3/web3Slice';
import filters, { getFilter, useFilterName } from './filters';
import { getComparator } from './sorting';
import TaskListWithSecondLevelFilters from './TaskListWithSecondLevelFilters';

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

const sort = (data, comparator) => [...data].sort(comparator);
const filter = (data, predicate) => data.filter(predicate);

const StyledDismissableAlert = styled(DismissableAlert)`
  margin-bottom: 1rem;
`;

const filterDescriptionMap = {
  [filters.open]: (
    <StyledDismissableAlert
      id="translator.filters.open"
      message="You will only be able to see tasks whose both source and target language you have self-declared level B2 or higher."
    />
  ),
  [filters.incomplete]: (
    <StyledDismissableAlert
      id="translator.filters.incomplete"
      message="Incomplete task are those which were not assigned to any translator or whose translator did not submit the translated text within the specified deadline."
    />
  ),
};
