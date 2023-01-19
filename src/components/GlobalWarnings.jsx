import React from 'react';
import { Alert } from '~/adapters/antd';

import Button from '~/shared/Button';
import { WarningIcon } from '~/shared/icons';

import { useWeb3 } from '~/hooks/useWeb3';
import { switchChain } from '~/utils/switchChain';
import {
  getCounterPartyChainId,
  getNetworkName,
  isSupportedChain,
  isSupportedSideChain,
  NETWORKS,
} from '~/consts/supportedChains';

const GlobalWarnings = () => {
  const { chainId } = useWeb3();
  const counterPartyChainId = getCounterPartyChainId(chainId);

  console.log(counterPartyChainId);
  const handleClick = event => {
    event.preventDefault();
    switchChain(counterPartyChainId ?? NETWORKS.gnosis);
  };

  return (
    <div
      css={`
        position: relative;

        :empty {
          display: none;
        }

        @media (max-width: 991.98px) {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 767.98px) {
          margin-bottom: 1rem;
        }

        @media (max-width: 575.98px) {
          margin-bottom: 2.5rem;
        }
      `}
    >
      {chainId !== -1 && !isSupportedSideChain(chainId) && (
        <Alert
          banner
          type="warning"
          icon={<WarningIcon />}
          message={
            <>
              {isSupportedChain(chainId)
                ? 'Linguo is moving to a side-chain for more affordable gas prices:'
                : 'Network Not Supported.'}{' '}
              <Button variant="link" onClick={handleClick}>
                Switch to {getNetworkName(counterPartyChainId ?? NETWORKS.gnosis)}.
              </Button>
            </>
          }
          css={`
            position: absolute;
            z-index: 1;
            top: 0;
            left: 0;
            right: 0;
          `}
        />
      )}
    </div>
  );
};

export default GlobalWarnings;
