import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useShallowEqualSelector } from '~/adapters/reactRedux';
import { useRefreshEffectOnce } from '~/adapters/reactRouterDom';
import TaskList from '~/features/tasks/TaskList';
import { fetchTasks, selectTasks } from '~/features/requester/requesterSlice';
import DismissableAlert from '~/features/ui/DismissableAlert';
import { selectAccount } from '~/features/web3/web3Slice';
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
  const displayableData = React.useMemo(() => sort(filter(data, getFilter(filterName)), getComparator(filterName)), [
    data,
    filterName,
  ]);

  const showFootnote = [filters.open].includes(filterName) && displayableData.length > 0;
  const showFilterDescription = displayableData.length > 0;

  return (
    <>
      {showFilterDescription && filterDescriptionMap[filterName]}
      <TaskList data={displayableData} showFootnote={showFootnote} />
    </>
  );
}

const sort = (data, comparator) => [...data].sort(comparator);
const filter = (data, predicate) => data.filter(predicate);

const StyledDismissableAlert = styled(DismissableAlert)`
  margin-bottom: 1rem;
`;

const filterDescriptionMap = {
  [filters.incomplete]: (
    <StyledDismissableAlert
      id="requester.filters.incomplete"
      message="Incomplete task are those which were not assigned to any translator or whose translator did not submit the translated text within the specified deadline."
    />
  ),
};
