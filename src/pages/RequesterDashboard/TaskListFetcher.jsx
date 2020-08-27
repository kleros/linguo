import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { filters, useFilter } from '~/features/requester';
import { fetchTasks, selectTasksForCurrentFilter } from '~/features/requester/requesterSlice';
import TaskList from '~/features/tasks/TaskList';
import DismissableAlert from '~/features/ui/DismissableAlert';
import { selectAccount } from '~/features/web3/web3Slice';

export default function TaskListFetcher() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);

  const doFetchTasks = React.useCallback(() => {
    dispatch(fetchTasks({ account }));
  }, [dispatch, account]);

  React.useEffect(() => {
    doFetchTasks();
  }, [doFetchTasks]);

  const displayableData = useShallowEqualSelector(state => selectTasksForCurrentFilter(state, { account }));
  const [filterName] = useFilter();

  const showFootnote = [filters.open].includes(filterName) && displayableData.length > 0;

  return (
    <>
      {filterDescriptionMap[filterName]}
      <TaskList data={displayableData} showFootnote={showFootnote} />
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
  [filters.open]: (
    <StyledDismissableAlert
      id="requester.filterNames.open"
      message="These are the tasks created by you which were not picked by any translators yet."
    />
  ),
  [filters.inProgress]: (
    <StyledDismissableAlert
      id="requester.filterNames.inProgress"
      message="Translators are currently working on these tasks."
    />
  ),
  [filters.inReview]: (
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
  [filters.inDispute]: (
    <StyledDismissableAlert
      id="requester.filterNames.inDispute"
      message="The translations below are being evaluated by specialized jurors on Kleros."
    />
  ),
  [filters.finished]: (
    <StyledDismissableAlert
      id="requester.filterNames.finished"
      message="The translations below were delivered and their translators received their payments."
    />
  ),
  [filters.incomplete]: (
    <StyledDismissableAlert
      id="requester.filterNames.incomplete"
      message="Incomplete task are those which were not assigned to any translator or whose translator did not submit the translated text within the specified deadline."
    />
  ),
};
