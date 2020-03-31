import React from 'react';
import styled from 'styled-components';
import { Alert } from 'antd';
import { getErrorMessage } from '~/adapters/web3React';
import { useWeb3React } from '~/app/web3React';
import SingleCardLayout from '~/pages/layouts/SingleCardLayout';
import WalletConnectionModal from '~/components/WalletConnectionModal';
import TranslationCreationForm from './Form';

const StyledAlert = styled(Alert)`
  margin-bottom: 2rem;
`;

const StyledOverlayWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const StyledOverlay = styled.div`
  display: ${props => (props.visible ? 'block' : 'none')};
  background-color: ${props => props.theme.hexToRgba('#fff', 0.5)};
  cursor: not-allowed;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
`;

const StyledContentWrapper = styled.div`
  filter: ${props => (props.disabled ? 'blur(1px)' : 'none')};
`;

function TranslationCreation() {
  const { account, activatingConnector, error } = useWeb3React();
  const [modalVisible, setModalVisible] = React.useState(false);

  const walletAlertVisible = !account && !activatingConnector;
  const formBlocked = !account;
  const errorAlertVisible = !!error;

  const handleOpenModalClick = evt => {
    evt.preventDefault();
    setModalVisible(true);
  };

  return (
    <SingleCardLayout title="New Translation">
      {errorAlertVisible ? <StyledAlert type="error" message={getErrorMessage(error)} /> : null}
      {walletAlertVisible ? (
        <>
          <StyledAlert
            type="warning"
            message={
              <>
                To request a translation you need an Ethereum wallet. Click{' '}
                <a href="#" onClick={handleOpenModalClick}>
                  here
                </a>{' '}
                to connect to a wallet.
              </>
            }
            description={
              <>
                Don&rsquo;t know what an ethereum wallet is?{' '}
                <a href="https://ethereum.org/wallets/" target="_blank" rel="noreferrer noopener">
                  Learn more
                </a>
              </>
            }
          />
          <WalletConnectionModal visible={modalVisible} setVisible={setModalVisible} />
        </>
      ) : null}
      <StyledOverlayWrapper>
        <StyledContentWrapper disabled={formBlocked}>
          <TranslationCreationForm />
        </StyledContentWrapper>
        <StyledOverlay visible={formBlocked} />
      </StyledOverlayWrapper>
    </SingleCardLayout>
  );
}

export default TranslationCreation;
