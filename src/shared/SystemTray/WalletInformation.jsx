import React from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';
import ReactBlockies from 'react-blockies';
import Button from '~/shared/Button';
import EthAddress from '~/shared/EthAddress';
import Spacer from '~/shared/Spacer';
import { useConnect } from '~/hooks/useConnect';
import { useWeb3 } from '~/hooks/useWeb3';

export default function WalletInformation() {
  const { account } = useWeb3();
  const { disconnect } = useConnect();

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
      <Button variant="outlined" onClick={disconnect}>
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
