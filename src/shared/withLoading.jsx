import React from 'react';
import t from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

const withLoading =
  ({ fallback = 'Loading...' } = {}) =>
  Component => {
    function WithLoading({ isLoading, ...props }) {
      return isLoading ? (
        typeof fallback === 'function' ? (
          fallback(Component, props)
        ) : (
          fallback
        )
      ) : (
        <Component {...props} />
      );
    }

    WithLoading.propTypes = {
      isLoading: t.bool.isRequired,
    };

    const componentName = Component.displayName ?? Component.name ?? '<anonymous>';
    WithLoading.displayName = `WithLoading(${componentName})`;

    return hoistNonReactStatics(WithLoading, Component);
  };

export default withLoading;
