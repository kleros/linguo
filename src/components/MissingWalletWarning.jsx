import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Alert } from 'antd';
import { getErrorMessage } from '~/adapters/web3React';
import { useWeb3React } from '~/app/web3React';
import WalletConnectionModal from '~/components/WalletConnectionModal';

const StyledAlert = styled(Alert)`
  margin-bottom: 2rem;
`;

function MissingWalletWarning({ message }) {
  const { account, activatingConnector, error } = useWeb3React();
  const [modalVisible, setModalVisible] = React.useState(false);

  const walletAlertVisible = !account && !activatingConnector;
  const errorAlertVisible = !!error;

  const handleOpenModalClick = evt => {
    evt.preventDefault();
    setModalVisible(true);
  };

  const appendedMessage = (
    <>
      Click{' '}
      <a href="#" onClick={handleOpenModalClick}>
        here
      </a>{' '}
      to connect to one.
    </>
  );

  const fullMessage = (
    <>
      {message} {appendedMessage}
    </>
  );

  return (
    <>
      {errorAlertVisible ? <StyledAlert type="error" message={getErrorMessage(error)} /> : null}
      {walletAlertVisible ? (
        <>
          <StyledAlert
            type="warning"
            message={fullMessage}
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
    </>
  );
}

MissingWalletWarning.propTypes = {
  message: t.string.isRequired,
};

export default MissingWalletWarning;
