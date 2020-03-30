import React from 'react';
import t from 'prop-types';

const AppContext = React.createContext([{ activatingConnector: undefined }, () => {}]);

export { AppContext as default };

function AppContextProvider({ children }) {
  const [state, setState] = React.useState({ activatingConnector: undefined });

  const patchState = React.useCallback(values => {
    setState(current => ({ ...current, ...values }));
  }, []);

  return <AppContext.Provider value={[state, patchState]}>{children}</AppContext.Provider>;
}

AppContextProvider.propTypes = {
  children: t.node.isRequired,
};

export { AppContextProvider };
