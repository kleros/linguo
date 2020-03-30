import React from 'react';
import { useWeb3React } from '~/app/web3React';
import SingleCardLayout from '~/pages/layouts/SingleCardLayout';
import WalletConnectionModal from '~/components/WalletConnectionModal';
import TranslationCreationForm from './Form';

function TranslationCreation() {
  const { account, activatingConnector } = useWeb3React();
  const [modalVisible, setModalVisible] = React.useState(!account && !activatingConnector);

  return (
    <SingleCardLayout title="New Translation">
      <WalletConnectionModal visible={modalVisible} setVisible={setModalVisible} />
      <TranslationCreationForm />
    </SingleCardLayout>
  );
}

export default TranslationCreation;
