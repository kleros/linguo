import React, { useEffect } from 'react';
import t from 'prop-types';

import { useWeb3React } from '@web3-react/core';
import { useInactiveListener, useEagerConnect } from '~/hooks/useWeb3';
import { network } from '~/connectors';

const Web3ConnectionManager = ({ children }) => {
  const { active } = useWeb3React();
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React('NETWORK');

  const triedEager = useEagerConnect();

  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(network);
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active]);

  useEffect(() => {
    if (active && networkActive) {
      network.pause();
    }
  }, [active, networkActive]);

  useEffect(() => {
    if (!active && networkActive) {
      network.resume();
    }
  }, [active, networkActive]);

  useInactiveListener(!triedEager);

  if (!active && !networkActive) {
    return <div>Loading...</div>;
  }
  return children;
};

export default Web3ConnectionManager;

Web3ConnectionManager.propTypes = {
  children: t.node,
};
