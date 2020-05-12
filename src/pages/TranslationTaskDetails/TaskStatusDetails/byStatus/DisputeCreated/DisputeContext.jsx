import React from 'react';
import t from 'prop-types';

const DisputeContext = React.createContext({});
DisputeContext.displayName = 'DisputeContext';

export default DisputeContext;

export function DisputeProvider({ dispute, children }) {
  return <DisputeContext.Provider value={dispute}>{children}</DisputeContext.Provider>;
}

DisputeProvider.propTypes = {
  dispute: t.object.isRequired,
  children: t.node,
};

DisputeProvider.defaultProps = {
  children: null,
};
