import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Alert } from 'antd';
import { useWeb3React } from '~/app/web3React';
import WalletConnectionModal from './WalletConnectionModal';
import RequiredWeb3Gateway from './RequiredWeb3Gateway';

const StyledAlert = styled(Alert)`
  margin-bottom: 2rem;
`;

function MissingWalletAlert({ message, missing, renderMissing }) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleOpenModalClick = React.useCallback(evt => {
    evt.preventDefault();
    setModalVisible(true);
  }, []);

  const appendedMessage = (
    <a href="#" onClick={handleOpenModalClick}>
      Click here to connect to a wallet.
    </a>
  );

  const fullMessage = (
    <>
      {message} {appendedMessage}
    </>
  );

  return (
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
      {missing || renderMissing()}
    </>
  );
}

MissingWalletAlert.propTypes = {
  message: t.string.isRequired,
  missing: t.node,
  renderMissing: t.func,
};

MissingWalletAlert.defaultProps = {
  missing: null,
  renderMissing: () => null,
};

function RequiredWalletGateway({ message, children, missing, error, render, renderMissing, renderError }) {
  const { active, account, activatingConnector } = useWeb3React();
  const hasAccount = active && !!account;
  const hasActivatingConnector = !!activatingConnector;

  const missingWalletWarning = <MissingWalletAlert message={message} missing={missing} renderMissing={renderMissing} />;

  return (
    <RequiredWeb3Gateway missing={missingWalletWarning} error={error} renderError={renderError}>
      {hasAccount ? children || render({ account }) : !hasActivatingConnector ? missingWalletWarning : null}
    </RequiredWeb3Gateway>
  );
}

RequiredWalletGateway.propTypes = {
  message: t.node.isRequired,
  children: t.node,
  missing: t.node,
  error: t.node,
  render: t.func,
  renderMissing: t.func,
  renderError: t.func,
};

RequiredWalletGateway.defaultProps = {
  children: null,
  missing: null,
  error: null,
};

export default RequiredWalletGateway;
