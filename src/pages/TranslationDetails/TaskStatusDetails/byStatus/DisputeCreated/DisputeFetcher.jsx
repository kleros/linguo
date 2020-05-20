import React from 'react';
import t from 'prop-types';
import { Alert, Spin } from 'antd';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { useCacheCall } from '~/app/linguo';
import { withSuspense } from '~/adapters/react';
import { withErrorBoundary } from '~/components/ErrorBoundary';
import compose from '~/utils/fp/compose';
import TaskContext from '../../../TaskContext';
import { DisputeProvider } from './DisputeContext';

function _DisputeFetcher({ children }) {
  const { ID } = React.useContext(TaskContext);
  const [{ data: dispute }] = useCacheCall(['getTaskDispute', ID], { suspense: true });

  return <DisputeProvider dispute={dispute}>{children}</DisputeProvider>;
}

_DisputeFetcher.propTypes = {
  children: t.node.isRequired,
};

const errorBoundaryEnhancer = withErrorBoundary({
  renderFallback: function ErrorBoundaryFallback(error) {
    return <Alert type="error" message={error.message} />;
  },
});

const suspenseEnhancer = withSuspense({
  fallback: (
    <div
      css={`
        position: relative;
      `}
    >
      <Spin
        spinning
        tip="Loading translation dispute details..."
        css={`
          &&.ant-spin {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        `}
      />
    </div>
  ),
});

const DisputeFetcher = compose(errorBoundaryEnhancer, suspenseEnhancer)(_DisputeFetcher);

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
