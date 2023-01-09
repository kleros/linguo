import React from 'react';
import { Titled } from 'react-titled';
import { Alert } from '~/adapters/antd';

import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import Button from '~/shared/Button';
import ContentBlocker from '~/shared/ContentBlocker';
import Spacer from '~/shared/Spacer';
import WithRouteMessage from '~/shared/WithRouteMessage';

import { useWeb3 } from '~/hooks/useWeb3';
import { getCounterPartyChainId, getNetworkName, isSupportedSideChain } from '~/consts/supportedChains';
import { switchChain } from '~/utils/switchChain';

import SingleCardLayout from '../layouts/SingleCardLayout';
import TranslationRequestForm from './TranslationRequestForm';

function TranslationRequest() {
  const { account, chainId } = useWeb3();
  const counterPartyChainId = getCounterPartyChainId(chainId);

  const formBlocked = !account || !isSupportedSideChain(chainId);

  const content = (
    <>
      {!isSupportedSideChain(chainId) && (
        <>
          <Alert
            showIcon
            type="info"
            message={`Linguo has been moved to ${getNetworkName(counterPartyChainId)}`}
            description={
              <>
                <p>Currently it is not possible to request new translations on {getNetworkName(chainId)}.</p>
                <p>
                  Get more affordable gas fees:{' '}
                  <Button variant="link" onClick={() => switchChain(counterPartyChainId)}>
                    Switch to {getNetworkName(counterPartyChainId)}
                  </Button>
                  .
                </p>
              </>
            }
          />
          <Spacer size={2} />
        </>
      )}
      <ContentBlocker blocked={formBlocked}>
        <TranslationRequestForm />
      </ContentBlocker>
    </>
  );

  return (
    <Titled title={title => `Translation Request | ${title}`}>
      <SingleCardLayout title="Request Translation">
        <WithRouteMessage>
          <RequiredWalletGateway
            message="To request a translation you need an Ethereum wallet."
            missing={content}
            error={content}
          >
            {content}
          </RequiredWalletGateway>
        </WithRouteMessage>
      </SingleCardLayout>
    </Titled>
  );
}

export default TranslationRequest;
