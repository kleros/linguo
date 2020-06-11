import React from 'react';
import { Alert, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { selectAllSkills } from '~/features/translator/translatorSlice';
import { useRefreshEffectOnce } from '~/adapters/reactRouterDom';
import { useWeb3React } from '~/features/web3';
import { useCacheCall } from '~/app/linguo';
import compose from '~/utils/fp/compose';
import { withSuspense } from '~/adapters/react';
import { withErrorBoundary } from '~/components/ErrorBoundary';
import { TaskListProvider } from './TaskListContext';
import TaskList from './TaskList';

const emptyTaskList = [];
const _1_MINUTE_IN_MILISECONDS = 60 * 1000;

function TaskListFetcher() {
  const { account } = useWeb3React();
  const skills = useSelector(selectAllSkills);

  const [{ data }, refetch] = useCacheCall(['getTranslatorTasks', account, skills], {
    suspense: true,
    initialData: emptyTaskList,
    refreshInterval: _1_MINUTE_IN_MILISECONDS,
  });

  useRefreshEffectOnce(refetch);

  return (
    <TaskListProvider taskList={data}>
      <TaskList />
    </TaskListProvider>
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
      tip="Loading the translation tasks..."
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
