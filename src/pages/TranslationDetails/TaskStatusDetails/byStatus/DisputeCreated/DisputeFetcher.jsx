import React from 'react';
import t from 'prop-types';
import { Spin } from 'antd';
import { Alert } from '~/adapters/antd';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { withErrorBoundary } from '~/shared/ErrorBoundary';
import Spacer from '~/shared/Spacer';
import useTask from '../../../useTask';
import { DisputeProvider } from './DisputeContext';
import { useDispatch, useSelector } from 'react-redux';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import {
  selectIsLoadingByTaskId,
  selectByTaskId,
  selectErrorByTaskId,
  fetchByTaskId,
} from '~/features/disputes/disputesSlice';

function _DisputeFetcher({ children }) {
  const { id: taskId } = useTask();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoadingByTaskId(taskId));
  const data = useShallowEqualSelector(selectByTaskId(taskId));
  const error = useShallowEqualSelector(selectErrorByTaskId(taskId));

  const doFetch = React.useCallback(() => {
    dispatch(fetchByTaskId({ taskId }));
  }, [dispatch, taskId]);

  React.useEffect(() => {
    doFetch();
  }, [doFetch]);

  return (
    <Spin tip="Loading translation dispute details..." spinning={isLoading && !data}>
      {error && (
        <>
          <Alert
            type="warning"
            message={error.message}
            description={
              data
                ? 'You are currently viewing a cached version which not might reflect the current state in the blockchain.'
                : null
            }
          />
          <Spacer size={2} />
        </>
      )}
      {data && <DisputeProvider dispute={data}>{children}</DisputeProvider>}
    </Spin>
  );
}

_DisputeFetcher.propTypes = {
  children: t.node.isRequired,
};

const errorBoundaryEnhancer = withErrorBoundary({
  renderFallback: function ErrorBoundaryFallback(error) {
    return <Alert type="error" message={error.message} />;
  },
});

const DisputeFetcher = errorBoundaryEnhancer(_DisputeFetcher);

export default DisputeFetcher;

export function withDisputeFetcher(Component) {
  function WithDisputeFetcher(props) {
    return (
      <DisputeFetcher>
        <Component {...props} />
      </DisputeFetcher>
    );
  }

  const componentName = Component.displayName ?? Component.name ?? '<anonymous>';
  WithDisputeFetcher.displayName = `WithDisputeFetcher(${componentName})`;

  return hoistNonReactStatics(WithDisputeFetcher, Component);
}
