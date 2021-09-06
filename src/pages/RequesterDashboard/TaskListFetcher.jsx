import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { Spin } from '~/adapters/antd';
import { statusFilters, useFilters } from '~/features/requester';
import { fetchTasks, selectTasksForCurrentFilter, selectIsLoading } from '~/features/requester/requesterSlice';
import TaskList from '~/features/tasks/TaskList';
import DismissableAlert from '~/features/ui/DismissableAlert';
import { selectAccount, selectChainId } from '~/features/web3/web3Slice';
import TopLoadingBar from '~/shared/TopLoadingBar';

export default function TaskListFetcher() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const chainId = useSelector(selectChainId);
  const isLoading = useSelector(state => selectIsLoading(state, { account, chainId }));

  const doFetchTasks = React.useCallback(() => {
    dispatch(fetchTasks({ chainId, account }));
  }, [dispatch, account, chainId]);

  React.useEffect(() => {
    doFetchTasks();
  }, [doFetchTasks]);

  const data = useShallowEqualSelector(state => selectTasksForCurrentFilter(state, { account, chainId }));
  const [filterName] = useFilters();

  const showFootnote = [statusFilters.open].includes(filterName) && data.length > 0;

  return (
    <>
      <TopLoadingBar show={isLoading} />
      <Spin $fixed tip="Loading translation tasks..." spinning={isLoading && data.length === 0}>
        <>
          {filterDescriptionMap[filterName]}
          <TaskList data={data} showFootnote={showFootnote} />
        </>
      </Spin>
    </>
  );
}

const StyledDismissableAlert = styled(DismissableAlert)`
  margin-bottom: 1rem;

  p + p {
    margin-top: 0;
  }
`;

const filterDescriptionMap = {
  [statusFilters.open]: (
    <StyledDismissableAlert
      id="requester.filterNames.open"
      message="These are the tasks created by you which were not picked by any translators yet."
    />
  ),
  [statusFilters.inProgress]: (
    <StyledDismissableAlert
      id="requester.filterNames.inProgress"
      message="Translators are currently working on these tasks."
    />
  ),
  [statusFilters.inReview]: (
    <StyledDismissableAlert
      id="requester.filterNames.inReview"
      message="The translated texts have been delivered by the translators."
      description={
        <>
          <p>
            They will be under review for some time to allow other translators to evaluate the quality of the work done.
          </p>
          <p>
            If there are issues with the translation, anyone (including yourself) can raise a challenge against any of
            the translations below.
          </p>
        </>
      }
    />
  ),
  [statusFilters.inDispute]: (
    <StyledDismissableAlert
      id="requester.filterNames.inDispute"
      message="The translations below are being evaluated by specialized jurors on Kleros."
    />
  ),
  [statusFilters.finished]: (
    <StyledDismissableAlert
      id="requester.filterNames.finished"
      message="The translations below were delivered and their translators received their payments."
    />
  ),
  [statusFilters.incomplete]: (
    <StyledDismissableAlert
      id="requester.filterNames.incomplete"
      message="Incomplete task are those which were not assigned to any translator or whose translator did not submit the translated text within the specified deadline."
    />
  ),
};
