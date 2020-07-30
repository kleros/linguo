import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { useRefreshEffectOnce } from '~/adapters/react-router-dom';
import * as r from '~/app/routes';
import TaskList from '~/features/tasks/TaskList';
import { fetchTasks, selectTasks } from '~/features/translator/translatorSlice';
import DismissableAlert from '~/features/ui/DismissableAlert';
import { selectAccount } from '~/features/web3/web3Slice';
import filters, { getFilter, useFilterName } from './filters';
import secondLevelFilters from './secondLevelFilters';
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
      <TaskListWithSecondLevelFilters filterName={filterName} data={displayableData} account={account}>
        {({ data, filterName: secondLevelFilterName }) => (
          <>
            {showFilterDescription && filterDescriptionMap[secondLevelFilterName ?? filterName]}
            <TaskList data={data} showFootnote={showFootnote} />
          </>
        )}
      </TaskListWithSecondLevelFilters>
    </>
  );
}

const sort = (data, comparator) => [...data].sort(comparator);
const filter = (data, predicate) => data.filter(predicate);

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
      message="You are currently working on translations below."
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
