import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { Typography } from 'antd';
import ReactBlockies from 'react-blockies';
import { useDisconnectFromProvider } from '~/features/web3';
import { selectAccount } from '~/features/web3/web3Slice';
import Button from '~/shared/Button';
import EthAddress from '~/shared/EthAddress';
import Spacer from '~/shared/Spacer';

export default function WalletInformation() {
  const account = useSelector(selectAccount);
  const disconnect = useDisconnectFromProvider();

  const handleDisconnect = React.useCallback(() => {
    disconnect();
  }, [disconnect]);

  return account ? (
    <StyledWalletInformationWrapper>
      <EthAddress
        address={account}
        css={`
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        `}
      >
        <StyledReactBlockies seed={account} shape="round" size={12} scale={2} />
        <StyledAccountAddress>
          {account.slice(0, 6)}...{account.slice(-4)}
        </StyledAccountAddress>
      </EthAddress>
      <Spacer />
      <Button variant="outlined" onClick={handleDisconnect}>
        Disconnect
      </Button>
    </StyledWalletInformationWrapper>
  ) : null;
}

const StyledWalletInformationWrapper = styled.div`
  a:hover {
    text-decoration: underline;
  }
`;

const StyledReactBlockies = styled(ReactBlockies)`
  border-radius: ${props => (props.shape === 'round' ? '100%' : 0)};
`;

const StyledAccountAddress = styled(Typography.Text)`
  font-size: ${p => p.theme.fontSize.sm};
  color: ${p => p.theme.color.text.default};
`;
