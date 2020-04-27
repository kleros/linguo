import React from 'react';
import { Redirect } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { useRefreshEffectOnce } from '~/adapters/reactRouterDom';
import * as r from '~/app/routes';
import { useWeb3React } from '~/app/web3React';
import { filters, getFilter, getComparator } from '~/api/linguo';
import { useCacheCall } from '~/app/linguo';
import { InfoIcon } from '~/components/icons';
import compose from '~/utils/fp/compose';
import { withSuspense } from '~/adapters/react';
import { withErrorBoundary } from '~/components/ErrorBoundary';
import TaskList from './TaskList';
import useFilter from './useFilter';

const sort = (data, comparator) => [...data].sort(comparator);
const filter = (data, predicate) => data.filter(predicate);

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

const emptyTaskList = [];
const _1_MINUTE_IN_MILISECONDS = 60 * 1000;

function TaskListFetcher() {
  const { account } = useWeb3React();

  const [{ data }, refetch] = useCacheCall(['getOwnTasks', account], {
    suspense: true,
    initialData: emptyTaskList,
    refreshInterval: _1_MINUTE_IN_MILISECONDS,
  });

  useRefreshEffectOnce(refetch);

  const shouldRedirect = data.length === 0;

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
    <>
      {showFilterDescription && filterDescriptionMap[filterName]}
      <TaskList data={displayableData} showFootnote={showFootnote} />
    </>
  );
}

const errorBoundaryEnhancer = withErrorBoundary({
  renderFallback: function ErrorBoundaryFallback(error) {
    return <Alert type="error" message={error.message} />;
  },
});

const suspenseEnhancer = withSuspense({
  fallback: (
    <Spin
      spinning
      tip="Loading the translations tasks you created..."
      css={`
        &&.ant-spin {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `}
    />
  ),
});

/**
 * ATTENTION: Order is important!
 * Since composition is evaluated right-to-left, `suspenseEnhancer` should be declared
 * **AFTER** `errorBoundaryEnhancer`
 */
export default compose(errorBoundaryEnhancer, suspenseEnhancer)(TaskListFetcher);
