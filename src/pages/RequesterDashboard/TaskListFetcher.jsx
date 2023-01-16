import React from 'react';
import styled from 'styled-components';
import { Spin } from '~/adapters/antd';

import DismissableAlert from '~/features/ui/DismissableAlert';
import TopLoadingBar from '~/shared/TopLoadingBar';

import TaskList from '~/components/TaskList';
import RequesterTaskCard from '~/components/RequesterTaskCard';

import { useWeb3 } from '~/hooks/useWeb3';
import { useTasksFilter } from '~/context/TasksFilterProvider';
import { useTasksByRequesterQuery } from '~/hooks/queries/useTasksByRequesterQuery';

import { statusFilters } from '~/consts/statusFilters';
import { getTasksByFilters, USER_TYPE } from '~/utils/getTasksByFilters';

export default function TaskListFetcher() {
  const { account } = useWeb3();
  const { filters } = useTasksFilter();

  const { tasks, isLoading } = useTasksByRequesterQuery(account.toLowerCase(), 0);
  const filteredTasks = !isLoading
    ? getTasksByFilters(tasks, { account: account.toLowerCase(), userType: USER_TYPE.requester, filters })
    : [];

  const showFootnote = [statusFilters.open].includes(filters.status) && tasks !== undefined;
  return (
    <>
      <TopLoadingBar show={isLoading} />
      <Spin $fixed tip="Loading translation tasks..." spinning={isLoading || tasks === undefined}>
        <>
          {filterDescriptionMap[filters.status]}
          {filteredTasks.length > 0 && (
            <TaskList data={filteredTasks} showFootnote={showFootnote}>
              {task => <RequesterTaskCard {...task} />}
            </TaskList>
          )}
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
