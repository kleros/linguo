import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Titled } from 'react-titled';
import { Alert } from '~/adapters/antd';
import { getNetworkName } from '~/features/web3';
import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import { getCounterPartyChainId, isSupportedSideChain } from '~/features/web3/supportedChains';
import { selectAccount, selectChainId, switchChain } from '~/features/web3/web3Slice';
import Button from '~/shared/Button';
import ContentBlocker from '~/shared/ContentBlocker';
import Spacer from '~/shared/Spacer';
import WithRouteMessage from '~/shared/WithRouteMessage';
import SingleCardLayout from '../layouts/SingleCardLayout';
import TranslationRequestForm from './TranslationRequestForm';

function TranslationRequest() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const chainId = useSelector(selectChainId);
  const counterPartyChainId = getCounterPartyChainId(chainId);

  const formBlocked = !account || !isSupportedSideChain(chainId);

  const content = (
    <>
      {!isSupportedSideChain(chainId) && (
        <>
          <Alert
            showIcon
            type="info"
            message={`Linguo is moving to ${getNetworkName(counterPartyChainId)}`}
            description={
              <>
                <p>Currently it is not possible to request new translations on {getNetworkName(chainId)}.</p>
                <p>
                  Get more affordable gas fees:{' '}
                  <Button variant="link" onClick={() => dispatch(switchChain({ chainId: counterPartyChainId }))}>
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
