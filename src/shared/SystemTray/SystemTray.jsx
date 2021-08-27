import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import theme from '~/features/ui/theme';
import { selectAccount } from '~/features/web3/web3Slice';
import WalletConnection from './WalletConnection';
import Notifications from './Notifications';
import Settings from './Settings';
import NetworkStatus from './NetworkStatus';
import HelpNav from './HelpNav';

export default function SystemTray() {
  const isConnected = !!useSelector(selectAccount);

  return (
    <StyledRow>
      <div
        css={`
          padding: 0 8px;
        `}
      >
        {isConnected ? <NetworkStatus textColor={theme.color.text.inverted} /> : <WalletConnection />}
      </div>
      <Notifications />
      <Settings />
      <HelpNav />
    </StyledRow>
  );
}

const StyledRow = styled.div`
  height: 4rem;
  display: flex;
  gap: 1rem;
  align-items: center;

  .ant-btn,
  .ant-badge {
    display: block;
  }
`;
