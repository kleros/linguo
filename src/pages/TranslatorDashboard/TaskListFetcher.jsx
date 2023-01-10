import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Spin } from '~/adapters/antd';
import * as r from '~/app/routes';

import TaskList from '~/features/translator/TaskList';
import DismissableAlert from '~/features/ui/DismissableAlert';
import TopLoadingBar from '~/shared/TopLoadingBar';

import { useTasksQuery } from '~/hooks/queries/useTasksQuery';
import { useWeb3 } from '~/hooks/useWeb3';
import { useTasksFilter } from '~/context/TasksFilterProvider';
import { statusFilters } from '~/consts/statusFilters';
import { getTasksByFilters } from '~/utils/getTasksByFilters';

export default function TaskListFetcher() {
  const { account } = useWeb3();
  const { filters } = useTasksFilter();

  const { tasks, isLoading } = useTasksQuery(0);

  const filteredTasks = !isLoading ? getTasksByFilters(tasks, account, filters) : [];
  const showFootnote = [statusFilters.open].includes(filters.status) && tasks !== undefined;

  return (
    <>
      <TopLoadingBar show={isLoading} />
      <Spin $fixed tip="Loading translation tasks..." spinning={isLoading || tasks === undefined}>
        {filterDescriptionMap[getFilterTreeName({ status: filters.status, allTasks: filters.allTasks })]}
        {filteredTasks && <TaskList data={filteredTasks} showFootnote={showFootnote} />}
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
  [getFilterTreeName({ status: 'open', allTasks: false })]: (
    <>
      <StyledDismissableAlert
        id="translator.filters.open"
        message="You will only be able to work on tasks whose both source and target languages you have self-declared level B2 or higher."
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
    </>
  ),
  [getFilterTreeName({ status: 'inProgress', allTasks: false })]: (
    <StyledDismissableAlert
      id="translator.filters.inProgress"
      message="You are currently working on the translations below."
    />
  ),
  [getFilterTreeName({ status: 'inReview', allTasks: false })]: (
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
  [getFilterTreeName({ status: 'inReview', allTasks: true })]: (
    <StyledDismissableAlert
      id="translator.filters.inReview.toReview"
      message="There might be translations delivered by other translators below."
      description={
        <>
          <p>If you think there are issues with any of them, you can raise a challenge.</p>
          <p>
            When there is a challenge, specialized jurors on the Kleros court will judge if the translation does or does
            not comply with the requirements.
          </p>
          <p>
            If they decide to reject the translation, you can receive the Translator Deposit - Arbitration Fees as a
            reward.
          </p>
        </>
      }
    />
  ),
  [getFilterTreeName({ status: 'incomplete', allTasks: false })]: (
    <StyledDismissableAlert
      id="translator.filters.incomplete"
      message="You were assigned to the tasks below but were not able to deliver the translation within the deadline."
    />
  ),
};

function getFilterTreeName({ status, allTasks }) {
  return [statusFilters[status] ?? 'all', allTasks].join('-');
}
