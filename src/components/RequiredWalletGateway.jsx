import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Alert } from '~/adapters/antd';
import WalletConnectionModal from './WalletConnectionModal';
import RequiredWeb3Gateway from './RequiredWeb3Gateway';
import { useWeb3 } from '~/hooks/useWeb3';
import { injected } from '~/connectors';

function RequiredWalletGateway({ message, children, missing, error, render, renderMissing, renderError }) {
  const { account, active, chainId, connector } = useWeb3();

  const isConnected = active && chainId && connector.name === injected.name;
  const hasAccount = isConnected && !!account;

  const missingWalletWarning = <MissingWalletAlert message={message} missing={missing} renderMissing={renderMissing} />;

  return (
    <RequiredWeb3Gateway missing={missingWalletWarning} error={error} renderError={renderError}>
      {hasAccount ? children || render({ account }) : missingWalletWarning}
    </RequiredWeb3Gateway>
  );
}

export function withRequiredWalletGateway({ message, missing, error, render, renderMissing, renderError }) {
  return Component => {
    function WithRequiredWallet(props) {
      return (
        <RequiredWalletGateway
          message={message}
          missing={missing}
          error={error}
          render={render}
          renderMissing={renderMissing}
          renderError={renderError}
        >
          <Component {...props} />
        </RequiredWalletGateway>
      );
    }

    const componentName = Component.displayName || Component.name || '<anonymous>';
    Object.defineProperty(WithRequiredWallet, 'name', { value: `WithRequiredWallet(${componentName})` });

    return WithRequiredWallet;
  };
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

const StyledAlert = styled(Alert)`
  margin-bottom: 2rem;
`;
