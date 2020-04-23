import React from 'react';
import t from 'prop-types';

const AppContext = React.createContext([{}, () => {}]);

export { AppContext as default };

function AppContextProvider({ children }) {
  const [state, setState] = React.useState({});

  const patchState = React.useCallback(values => {
    setState(current => ({ ...current, ...values }));
  }, []);

  return <AppContext.Provider value={[state, patchState]}>{children}</AppContext.Provider>;
}

AppContextProvider.propTypes = {
  children: t.node.isRequired,
};

export { AppContextProvider };
