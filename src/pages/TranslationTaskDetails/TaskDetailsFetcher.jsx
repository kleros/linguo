import React from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { useCacheCall } from '~/app/linguo';
import { useRefreshEffectOnce } from '~/adapters/reactRouterDom';
import compose from '~/utils/fp/compose';
import { withSuspense } from '~/adapters/react';
import { withErrorBoundary } from '~/components/ErrorBoundary';
import { TaskProvider } from './TaskContext';
import TaskDetails from './TaskDetails';

const _1_MINUTE_IN_MILISECONDS = 60 * 1000;

function TaskDetailsFetcher() {
  const params = useParams();
  const ID = Number(params.id);

  const [{ data }, refetch] = useCacheCall(['getTaskById', ID], {
    suspense: true,
    refreshInterval: _1_MINUTE_IN_MILISECONDS,
  });

  useRefreshEffectOnce(refetch);

  return (
    <TaskProvider task={data}>
      <TaskDetails />
    </TaskProvider>
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
      tip="Loading the translation tasks details"
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
export default compose(errorBoundaryEnhancer, suspenseEnhancer)(TaskDetailsFetcher);
