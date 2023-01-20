import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { Row, Col, Divider, Typography, Spin } from 'antd';
import Button from '~/shared/Button';
import Modal from '~/shared/Modal';
import MetamaskLogo from '~/assets/images/logo-metamask.svg';
import WalletConnectLogo from '~/assets/images/logo-walletconnect.svg';
import { selectIsConnecting, selectIsConnected } from '../features/web3/web3Slice';
import { useConnectToProvider } from '../features/web3/hooks';
import { injected, walletConnect } from '~/connectors';

function WalletConnectionModal({ visible, setVisible, onCancel }) {
  const isConnecting = useSelector(selectIsConnecting);
  const isConnected = useSelector(selectIsConnected);

  React.useEffect(() => {
    if (isConnected) {
      setVisible(false);
    }
  }, [isConnected, setVisible]);

  const handleCancel = () => {
    setVisible(false);
    onCancel();
  };

  const connect = useConnectToProvider();

  const handleMetamaskActivation = React.useCallback(() => {
    connect(injected.name);
  }, [connect]);

  const handleWalletConnectActivation = React.useCallback(() => {
    connect(walletConnect.name);
  }, [connect]);

  return (
    <Modal centered visible={visible} title="Connect to a Wallet" footer={null} onCancel={handleCancel}>
      <Spin spinning={isConnecting} tip="Connecting...">
        <Row gutter={[16, 16]} align="center">
          <Col sm={8} xs={12}>
            <StyledWalletButton fullWidth variant="outlined" onClick={handleMetamaskActivation}>
              <MetamaskLogo className="logo" />
              <span className="description">Metamask</span>
            </StyledWalletButton>
          </Col>
          <Col sm={8} xs={12}>
            <StyledWalletButton fullWidth variant="outlined" onClick={handleWalletConnectActivation}>
              <WalletConnectLogo className="logo" />
              <span className="description">WalletConnect</span>
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
      </Spin>
    </Modal>
  );
}

WalletConnectionModal.propTypes = {
  visible: t.bool.isRequired,
  setVisible: t.func.isRequired,
  onCancel: t.func,
};

WalletConnectionModal.defaultProps = {
  onCancel: () => {},
};

export default WalletConnectionModal;

const StyledWalletButton = styled(Button)`
  border-radius: 0.75rem;
  height: 100%;

  > span {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    padding: 1rem;

    .logo {
      width: 64px;
      height: 64px;
    }

    .description {
      margin-top: 1rem;
    }
  }
`;

const StyledHelperText = styled(Typography.Text)`
  && {
    display: block;
    text-align: center;
    color: ${props => props.theme.color.text.default};
  }
`;

const StyledDivider = styled(Divider)`
  border-top: none;
`;
