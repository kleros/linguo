import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useAsync, IfPending, IfFulfilled, IfRejected } from 'react-async';
import { Row, Typography, Skeleton, Alert } from 'antd';
import ReactBlockies from 'react-blockies';
import { useWeb3React } from '~/app/web3React';
import EthLogo from '~/assets/images/logo-eth.svg';
import EthAddress from '~/components/EthAddress';
import EthValue from '~/components/EthValue';

const StyledAccountRow = styled(Row)`
  align-items: center;

  a {
    color: ${props => props.theme.text.default};
  }

  a:hover {
    text-decoration: underline;
  }
`;

const StyledReactBlockies = styled(ReactBlockies)`
  border-radius: ${props => (props.shape === 'round' ? '100%' : 0)};
  width: 3.75rem;
  height 3.75rem;
`;

const StyledText = styled(Typography.Text)`
  font-size: ${props => props.theme.fontSize.xl};
  margin-left: 1rem;
  color: inherit;
`;

function EthAccount({ address }) {
  return (
    <StyledAccountRow>
      <EthAddress
        address={address}
        css={`
          display: flex;
          align-items: center;
        `}
      >
        <StyledReactBlockies seed={address} shape="round" size={10} scale={4} />
        <StyledText>
          {address.slice(0, 6)}...{address.slice(-4)}
        </StyledText>
      </EthAddress>
    </StyledAccountRow>
  );
}

EthAccount.propTypes = {
  address: t.string.isRequired,
};

const StyledBalanceRow = styled(Row)`
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`;

const StyledEthLogo = styled(EthLogo)`
  flex: 2.4rem 0 0;
`;

const StyledBalanceDisplay = styled.span`
  color: ${props => props.theme.text.default};
  flex: auto 0 0;
  font-size: 2rem;
  line-height: 4rem;
  margin-left: 2rem;
`;

const StyledBalanceAlert = styled(Alert)`
  margin-top: 1rem;
  width: 100%;
`;

function EthBalance({ decimals, ...state }) {
  const balance = state.data || '0';

  return (
    <StyledBalanceRow>
      <IfPending state={state}>
        <Skeleton active paragraph={false} />
      </IfPending>
      <IfRejected state={state}>
        <StyledBalanceAlert type="error" message="Failed to get the balance" />
      </IfRejected>
      <IfFulfilled state={state}>
        <StyledEthLogo />
        <StyledBalanceDisplay>
          <EthValue amount={balance} decimals={decimals} suffixType="short" />
        </StyledBalanceDisplay>
      </IfFulfilled>
    </StyledBalanceRow>
  );
}

EthBalance.propTypes = {
  data: t.string,
  decimals: t.number,
};

EthBalance.defaultProps = {
  decimals: 18,
};

const StyledSection = styled.section`
  margin: 1rem 0;

  :last-child {
    margin-bottom: 0;
  }
`;

const StyledBalanceInnerContainer = styled.div`
  background-color: ${props => props.theme.background.default};
  border-radius: 0.75rem;
  padding: 1.5rem;
`;

const StyledBalanceTitle = styled(Typography.Title)`
  && {
    color: ${props => props.theme.text.default};
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: 400;
    text-align: center;
    margin-top: -0.5rem;
    margin-bottom: -0.5rem;
  }
`;

async function getBalance({ web3, account }) {
  if (!account) {
    throw new Error('Invalid account');
  }

  return web3.eth.getBalance(account);
}

function shouldUpdateBalance(current, prev) {
  return current.account !== prev.account || current.chainId !== prev.chainId;
}

export default function WalletInformation() {
  const { account, library: web3, chainId } = useWeb3React();

  const balanceState = useAsync({
    promiseFn: getBalance,
    watchFn: shouldUpdateBalance,
    web3,
    chainId,
    account,
  });

  return account ? (
    <>
      <StyledSection>
        <EthAccount address={account} />
      </StyledSection>
      <StyledSection>
        <StyledBalanceInnerContainer>
          <StyledBalanceTitle level={3}>Balance</StyledBalanceTitle>
          <EthBalance decimals={6} {...balanceState} />
        </StyledBalanceInnerContainer>
      </StyledSection>
    </>
  ) : null;
}
