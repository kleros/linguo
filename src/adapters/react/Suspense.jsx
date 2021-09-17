import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

export const withSuspense =
  ({ fallback = 'Loading...' } = {}) =>
  Component => {
    function WithSuspense(props) {
      return (
        <React.Suspense fallback={fallback}>
          <Component {...props} />
        </React.Suspense>
      );
    }

    const componentName = Component.displayName ?? Component.name ?? '<anonymous>';
    WithSuspense.displayName = `WithSuspense(${componentName})`;

    return hoistNonReactStatics(WithSuspense, Component);
  };
