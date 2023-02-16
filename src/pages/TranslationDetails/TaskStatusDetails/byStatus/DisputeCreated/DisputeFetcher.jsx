import React from 'react';
import t from 'prop-types';

import { Spin } from 'antd';
import { Alert } from '~/adapters/antd';
import { withErrorBoundary } from '~/shared/ErrorBoundary';
import Spacer from '~/shared/Spacer';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import { useDispute } from '~/hooks/useDispute';

function _DisputeFetcher({ children }) {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const { disputeID, latestRoundId } = task;
  const { isLoading, error } = useDispute(disputeID, latestRoundId);

  return (
    <Spin tip="Loading translation dispute details..." spinning={isLoading}>
      {error && (
        <>
          <Alert
            type="warning"
            message={error.message}
            description={
              isLoading
                ? 'You are currently viewing a cached version which not might reflect the current state in the blockchain.'
                : null
            }
          />
          <Spacer size={2} />
        </>
      )}
      {!isLoading && children}
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
