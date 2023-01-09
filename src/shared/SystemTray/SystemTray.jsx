import React from 'react';
import styled from 'styled-components';
import theme from '~/features/ui/theme';
import WalletConnection from '~/components/modals/WalletConnection';
import Notifications from './Notifications';
import Settings from './Settings';
import NetworkStatus from './NetworkStatus';
import HelpNav from './HelpNav';
import { useWeb3 } from '~/hooks/useWeb3';

export default function SystemTray() {
  const { active, connector } = useWeb3();
  const isNetwork = connector.name === 'network';
  return (
    <StyledRow>
      <StyledNetworkStatusWrapper>
        {active && !isNetwork ? <StyledNetworkStatus textColor={theme.color.text.inverted} /> : <WalletConnection />}
      </StyledNetworkStatusWrapper>
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
    display: flex;
  }
`;

const StyledNetworkStatus = styled(NetworkStatus)``;

const StyledNetworkStatusWrapper = styled.div`
  @media (max-width: 767.98px) {
    padding: 0 8px;

    ${StyledNetworkStatus} {
      font-size: ${p => p.theme.fontSize.xl};
    }
  }
`;
