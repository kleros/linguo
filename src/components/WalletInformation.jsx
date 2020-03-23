import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { useAsync, IfPending, IfFulfilled, IfRejected } from 'react-async';
import { Row, Typography, Skeleton, Alert } from 'antd';
import ReactBlockies from 'react-blockies';
import EthLogo from '~/assets/images/logo-eth.svg';

const StyledSection = styled.section`
  margin: 1rem 0;

  :last-child {
    margin-bottom: 0;
  }
`;

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
  font-size: 1.125rem;
  margin-left: 1rem;
  color: inherit;
`;

function EthAccount({ address }) {
  return (
    <StyledSection>
      <StyledAccountRow>
        <a
          href={`https://etherscan.io/address/${address}`}
          rel="noopener noreferrer"
          target="_blank"
          css={`
            display: flex;
            align-items: center;
          `}
        >
          <StyledReactBlockies seed={address} shape="round" size={10} scale={4} />
          <StyledText>
            {address.slice(0, 6)}...{address.slice(-4)}
          </StyledText>
        </a>
      </StyledAccountRow>
    </StyledSection>
  );
}

EthAccount.propTypes = {
  address: t.string.isRequired,
};

const StyledBalanceInnerContainer = styled.div`
  background-color: ${props => props.theme.background.default};
  border-radius: 0.75rem;
  padding: 1.5rem;
`;

const StyledBalanceTitle = styled(Typography.Title)`
  && {
    color: ${props => props.theme.text.default};
    font-size: 0.875rem;
    font-weight: 400;
    text-align: center;
    line-height: 0.875rem;
    margin-top: -0.75rem;
    margin-bottom: -0.5rem;
  }
`;

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

const getBalance = async ({ library, account }, { signal }) => {
  if (!account) {
    throw new Error('Invalid account');
  }

  const balance = await library.eth.getBalance(account);
  return library.utils.fromWei(balance, 'ether');
};

const shouldUpdateBalance = (current, prev) => {
  return current.account !== prev.account || current.chainId !== prev.chainId;
};

function EthBalance({ decimals }) {
  const { account, library, chainId } = useWeb3React();

  const state = useAsync({
    promiseFn: getBalance,
    watchFn: shouldUpdateBalance,
    library,
    chainId,
    account,
  });

  return (
    <StyledSection>
      <StyledBalanceInnerContainer>
        <StyledBalanceTitle level={3}>Balance</StyledBalanceTitle>
        <StyledBalanceRow>
          <IfPending state={state}>
            <Skeleton active paragraph={false} />
          </IfPending>
          <IfRejected state={state}>
            <StyledBalanceAlert type="error" message="Failed to get the balance" />
          </IfRejected>
          <IfFulfilled state={state}>
            <StyledEthLogo />
            <StyledBalanceDisplay>{Number(state.data).toFixed(decimals)} ETH</StyledBalanceDisplay>
          </IfFulfilled>
        </StyledBalanceRow>
      </StyledBalanceInnerContainer>
    </StyledSection>
  );
}

EthBalance.propTypes = {
  decimals: t.number,
};

EthBalance.defaultProps = {
  decimals: 18,
};

export default function WalletInformation() {
  const { account } = useWeb3React();

  return account ? (
    <>
      <EthAccount address={account} />
      <EthBalance decimals={6} />
    </>
  ) : null;
}
