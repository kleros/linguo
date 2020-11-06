import React from 'react';
import { Titled } from 'react-titled';
import { useWeb3React } from '~/features/web3';
import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import WithRouteMessage from '~/shared/WithRouteMessage';
import ContentBlocker from '~/shared/ContentBlocker';
import SingleCardLayout from '../layouts/SingleCardLayout';
import TranslationRequestForm from './TranslationRequestForm';

function TranslationRequest() {
  const { account } = useWeb3React();
  const formBlocked = !account;

  const form = (
    <ContentBlocker blocked={formBlocked}>
      <TranslationRequestForm />
    </ContentBlocker>
  );

  return (
    <Titled title={title => `Translation Request | ${title}`}>
      <SingleCardLayout title="Request Translation">
        <WithRouteMessage>
          <RequiredWalletGateway
            message="To request a translation you need an Ethereum wallet."
            missing={form}
            error={form}
          >
            {form}
          </RequiredWalletGateway>
        </WithRouteMessage>
      </SingleCardLayout>
    </Titled>
  );
}

export default TranslationRequest;
