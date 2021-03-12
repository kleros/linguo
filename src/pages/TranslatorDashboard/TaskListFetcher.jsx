import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { Spin } from '~/adapters/antd';
import * as r from '~/app/routes';
import TaskList from '~/features/translator/TaskList';
import { statusFilters, useFilters } from '~/features/translator';
import {
  fetchTasks,
  selectAllSkills,
  selectIsLoading,
  selectTasksForFilter,
} from '~/features/translator/translatorSlice';
import DismissableAlert from '~/features/ui/DismissableAlert';
import { selectAccount } from '~/features/web3/web3Slice';
import TopLoadingBar from '~/shared/TopLoadingBar';

export default function TaskListFetcher() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const isLoading = useSelector(state => selectIsLoading(state, { account }));
  const skills = useShallowEqualSelector(selectAllSkills);

  const doFetchTasks = React.useCallback(() => {
    dispatch(fetchTasks({ account }));
  }, [dispatch, account]);

  React.useEffect(() => {
    doFetchTasks();
  }, [doFetchTasks]);

  const [{ status, allTasks }] = useFilters();

  const data = useShallowEqualSelector(state =>
    selectTasksForFilter(state, {
      status,
      allTasks: status === statusFilters.open ? true : allTasks,
      account,
      skills,
    })
  );
  const showFootnote = [statusFilters.open].includes(status) && data.length > 0;

  return (
    <>
      <TopLoadingBar show={isLoading} />
      <Spin $fixed tip="Loading translation tasks..." spinning={isLoading && data.length === 0}>
        {filterDescriptionMap[getFilterTreeName({ status, allTasks })]}
        <TaskList data={data} showFootnote={showFootnote} />
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
