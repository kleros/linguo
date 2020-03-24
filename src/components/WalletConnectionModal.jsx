import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { Row, Col, Divider, Typography } from 'antd';
import { injected, fortmatic } from '~/app/connectors';
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

const createHandleActivation = (connector, { activate, setError, setVisible }) => async () => {
  try {
    await activate(connector, setError, true);
    setVisible(false);
  } catch {}
};

function WalletConnectionModal({ visible, setVisible }) {
  const { activate, setError } = useWeb3React();

  const handleMetamaskConnect = createHandleActivation(injected, {
    activate,
    setError,
    setVisible,
  });

  const handleFortmaticConnect = createHandleActivation(fortmatic, {
    activate,
    setError,
    setVisible,
  });

  return (
    <Modal centered visible={visible} onCancel={() => setVisible(false)} title="Connect to a Wallet" footer={null}>
      <Row gutter={[16, 16]} align="center">
        <Col sm={8} xs={12}>
          <StyledWalletButton fullWidth variant="outlined" onClick={handleMetamaskConnect}>
            <MetamaskLogo className="logo" />
            <span className="description">Metamask</span>
          </StyledWalletButton>
        </Col>
        <Col sm={8} xs={12}>
          <StyledWalletButton fullWidth variant="outlined" onClick={handleFortmaticConnect}>
            <FortmaticLogo className="logo" />
            <span className="description">Fortmatic</span>
          </StyledWalletButton>
        </Col>
      </Row>
      <Divider />
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

export default WalletConnectionModal;
