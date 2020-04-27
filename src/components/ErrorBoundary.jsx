import React from 'react';
import t from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static propTypes = {
    fallback: t.node,
    renderFallback: t.func,
    children: t.node,
  };

  static defaultProps = {
    children: null,
    renderFallback: error => error,
  };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  render() {
    const { error, hasError } = this.state;

    if (hasError) {
      return this.props.fallback || this.props.renderFallback(error);
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

export const withErrorBoundary = ({ fallback, renderFallback } = {}) => Component => {
  function WithErrorBoundary(props) {
    return (
      <ErrorBoundary fallback={fallback} renderFallback={renderFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  }

  const componentName = Component.displayName ?? Component.name ?? '<anonymous>';
  WithErrorBoundary.displayName = `WithErrorBoundary(${componentName})`;

  return hoistNonReactStatics(WithErrorBoundary, Component);
};
