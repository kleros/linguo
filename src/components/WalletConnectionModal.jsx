import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { Row, Col, Divider, Typography, Alert } from 'antd';
import { getErrorMessage } from '~/adapters/web3React';
import { injected, fortmatic } from '~/app/connectors';
import { useSettings, WEB3_PROVIDER } from '~/app/settings';
import Button from '~/components/Button';
import Modal from '~/components/Modal';
import MetamaskLogo from '~/assets/images/logo-metamask.svg';
import FortmaticLogo from '~/assets/images/logo-fortmatic.svg';

const StyledWalletButton = styled(Button)`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding: 1rem;

  .logo {
    width: 60%;
    height: auto;
  }

  .description {
    margin-top: 1rem;
  }
`;

const StyledHelperText = styled(Typography.Text)`
  && {
    display: block;
    text-align: center;
    color: ${props => props.theme.text.default};
  }
`;

const StyledAlert = styled(Alert)`
  margin-bottom: 2rem;
`;

const StyledDivider = styled(Divider)`
  background: none;
`;

const createHandleActivation = (connector, { activate, setError, setVisible, setWeb3ProviderSettings }) => async () => {
  try {
    setError(null);
    await activate(connector, undefined, true);
    setWeb3ProviderSettings({
      allowEagerConnection: true,
      connectorName: connector.name,
    });
    setVisible(false);
  } catch (err) {
    setError(err);
  }
};

function WalletConnectionModal({ visible, setVisible }) {
  const { activate } = useWeb3React();
  const [error, setError] = React.useState(null);

  const [_, setWeb3ProviderSettings] = useSettings(WEB3_PROVIDER.key, WEB3_PROVIDER.initialValue);

  const handleCancel = () => {
    setVisible(false);
    setError(null);
  };

  const handleMetamaskActivation = createHandleActivation(injected, {
    activate,
    setError,
    setVisible,
    setWeb3ProviderSettings,
  });

  const handleFortmaticActivation = createHandleActivation(fortmatic, {
    activate,
    setError,
    setVisible,
    setWeb3ProviderSettings,
  });

  return (
    <Modal centered visible={visible} onCancel={handleCancel} title="Connect to a Wallet" footer={null}>
      {error && <StyledAlert type="error" message={getErrorMessage(error)} />}
      <Row gutter={[16, 16]} align="center">
        <Col sm={8} xs={12}>
          <StyledWalletButton fullWidth variant="outlined" onClick={handleMetamaskActivation}>
            <MetamaskLogo className="logo" />
            <span className="description">Metamask</span>
          </StyledWalletButton>
        </Col>
        <Col sm={8} xs={12}>
          <StyledWalletButton fullWidth variant="outlined" onClick={handleFortmaticActivation}>
            <FortmaticLogo className="logo" />
            <span className="description">Fortmatic</span>
          </StyledWalletButton>
        </Col>
      </Row>
      <StyledDivider />
      <StyledHelperText>
        Don&rsquo;t know what an ethereum wallet is?{' '}
        <a href="https://ethereum.org/wallets/" target="_blank" rel="noreferrer noopener">
          Learn more
        </a>
        .
      </StyledHelperText>
    </Modal>
  );
}

WalletConnectionModal.propTypes = {
  visible: t.bool.isRequired,
  setVisible: t.func.isRequired,
};

WalletConnectionModal.defaultProps = {
  onActivate: () => {},
};

export default WalletConnectionModal;
