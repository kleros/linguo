import React from 'react';
import styled from 'styled-components';
import { Redirect } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { useRefreshEffectOnce } from '~/adapters/reactRouterDom';
import * as r from '~/app/routes';
import { useWeb3React } from '~/app/web3React';
import useAsyncState from '~/hooks/useAsyncState';
import { filters, getFilter, getComparator } from '~/api/linguo';
import { useLinguo } from '~/app/linguo';
import { InfoIcon } from '~/components/icons';
import TaskList from './TaskList';
import useFilter from './useFilter';

const StyledSpin = styled(Spin)`
  &&.ant-spin {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin-left: -1rem;
    margin-right: -1rem;
  }
`;

const StyledAlert = styled(Alert)`
  margin-bottom: 1rem;
`;

const sort = (data, comparator) => [...data].sort(comparator);
const filter = (data, predicate) => data.filter(predicate);

const filterDescriptionMap = {
  [filters.incomplete]: (
    <StyledAlert
      showIcon
      icon={<InfoIcon />}
      type="info"
      message="Incomplete taks are those which were not assigned to any translator or whose translator did not submit the translated text within the specified deadline."
    />
  ),
};

const emptyTaskList = [];

function TaskListFetcher() {
  const { account } = useWeb3React();
  const linguo = useLinguo();

  const [{ data, error, isLoading, isSuccess }, refetch] = useAsyncState(
    React.useCallback(async () => linguo.api.getOwnTasks({ account }), [linguo.api, account]),
    emptyTaskList
  );

  useRefreshEffectOnce(refetch);

  const shouldRedirect = isSuccess && data.length === 0;
  const showError = !!(linguo.error || error);
  const errorMessage = linguo.error?.message || error?.message;

  const [filterName] = useFilter();

  const displayableData = React.useMemo(() => sort(filter(data, getFilter(filterName)), getComparator(filterName)), [
    data,
    filterName,
  ]);
  const showFootnote = [filters.open].includes(filterName) && displayableData.length > 0;
  const showFilterDescription = displayableData.length > 0;

  return shouldRedirect ? (
    <Redirect
      to={{
        pathname: r.TRANSLATION_REQUEST,
        state: {
          message: 'You have no tranlsation requests yet! You can create one here.',
        },
      }}
    />
  ) : (
    <StyledSpin
      tip="Loading the translations tasks you created..."
      spinning={isLoading}
      wrapperClassName="foooo"
    >
      {showError && <StyledAlert type="error" message={errorMessage} />}
      {showFilterDescription && filterDescriptionMap[filterName]}
      <TaskList data={displayableData} showFootnote={showFootnote} />
    </StyledSpin>
  );
}

export default TaskListFetcher;
