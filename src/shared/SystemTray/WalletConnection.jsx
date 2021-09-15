import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { Button as AntdButton, Spin, Typography } from 'antd';
import { Popover } from '~/adapters/antd';
import FortmaticLogo from '~/assets/images/logo-fortmatic.svg';
import MetamaskLogo from '~/assets/images/logo-metamask.svg';
import { useConnectToProvider } from '~/features/web3';
import { selectIsConnecting } from '~/features/web3/web3Slice';
import { fortmatic, injected } from '~/features/web3/connectors';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import { HelpIcon } from '~/shared/icons';
import SystemTrayButton from './SystemTrayButton';
import { defaultChainId } from '~/features/web3/supportedChains';

export default function WalletConnection() {
  const [visible, setVisible] = React.useState(false);

  const handleVisibilityChange = React.useCallback(visible => {
    setVisible(visible);
  }, []);

  return (
    <StyledPopover
      arrowPointAtCenter
      content={<WalletConnectionContent />}
      footer={
        <StyledHelperText>
          New to Ethereum?{' '}
          <AntdButton type="link" href="https://ethereum.org/wallets/" target="_blank" rel="noreferrer noopener">
            Learn more about wallets <HelpIcon />
          </AntdButton>
        </StyledHelperText>
      }
      title="Connect to a Wallet"
      placement="bottomRight"
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibilityChange}
    >
      <SystemTrayButton>Connect</SystemTrayButton>
    </StyledPopover>
  );
}

const StyledPopover = styled(Popover)`
  width: 32rem;

  @media (max-width: 31.98rem) {
    width: 100%;
  }
`;

function WalletConnectionContent() {
  const isConnecting = useSelector(selectIsConnecting);

  const connect = useConnectToProvider();

  const handleMetamaskActivation = React.useCallback(() => {
    connect(injected.name);
  }, [connect]);

  const handleFortmaticActivation = React.useCallback(() => {
    connect(fortmatic.name);
  }, [connect]);

  return (
    <Spin spinning={isConnecting} tip="Connecting...">
      <Spacer />
      <StyledButtonList>
        <StyledButtonListItem>
          <StyledWalletButton fullWidth variant="link" onClick={handleMetamaskActivation}>
            <MetamaskLogo className="logo" />
            <span className="description">Metamask</span>
          </StyledWalletButton>
        </StyledButtonListItem>
        {[1, 42].includes(defaultChainId) ? (
          <StyledButtonListItem>
            <StyledWalletButton fullWidth variant="link" onClick={handleFortmaticActivation}>
              <FortmaticLogo className="logo" />
              <span className="description">Fortmatic</span>
            </StyledWalletButton>
          </StyledButtonListItem>
        ) : null}
      </StyledButtonList>
    </Spin>
  );
}

const StyledButtonList = styled.ul`
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StyledButtonListItem = styled.li`
  width: 6rem;
`;

const StyledWalletButton = styled(Button)`
  border-radius: 0.75rem;
  > span {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    padding: 1rem;

    .logo {
      max-width: 2.5rem;
      max-height: 2.5rem;
      height: auto;
    }

    .description {
      margin-top: 1rem;
      font-size: ${p => p.theme.fontSize.sm};
      font-weight: ${p => p.theme.fontWeight.regular};
      color: ${p => p.theme.color.text.default};
    }
  }
`;

const StyledHelperText = styled(Typography.Text)`
  color: inherit;

  && {
    > .ant-btn-link {
      font-weight: ${p => p.theme.fontWeight.semibold};
      padding: 0;
    }
  }
`;
