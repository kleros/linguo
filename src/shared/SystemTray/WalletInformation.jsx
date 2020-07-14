import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Row, Typography, Skeleton, Alert } from 'antd';
import ReactBlockies from 'react-blockies';
import EthLogo from '~/assets/images/logo-eth.svg';
import EthAddress from '~/shared/EthAddress';
import EthValue from '~/shared/EthValue';
import { useSelector, useDispatch } from 'react-redux';
import { selectBalance, selectAccount, getBalance } from '~/features/web3/web3Slice';

export default function WalletInformation() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const balance = useSelector(selectBalance(account));

  const [state, setState] = React.useState('idle');

  const fetchBalance = React.useCallback(async () => {
    setState('pending');
    try {
      await dispatch(
        getBalance(
          { account },
          {
            meta: {
              thunk: { id: account },
            },
          }
        )
      );
      setState('succeeded');
    } catch (err) {
      setState('failed');
    }
  }, [dispatch, account]);

  React.useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return account ? (
    <>
      <StyledSection>
        <EthAccount address={account} />
      </StyledSection>
      <StyledSection>
        <StyledBalanceInnerContainer>
          <StyledBalanceTitle level={3}>Balance</StyledBalanceTitle>
          {state === 'succeeded' && <EthBalance decimals={6} balance={balance} />}
          {state === 'failed' && <StyledBalanceAlert type="error" message="Failed to get the balance" />}
          {state === 'pending' && <Skeleton active paragraph={false} />}
        </StyledBalanceInnerContainer>
      </StyledSection>
    </>
  ) : null;
}

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

function EthBalance({ decimals, balance }) {
  return (
    <StyledBalanceRow>
      <StyledEthLogo />
      <StyledBalanceDisplay>
        <EthValue amount={balance} decimals={decimals} suffixType="short" />
      </StyledBalanceDisplay>
    </StyledBalanceRow>
  );
}

EthBalance.propTypes = {
  balance: t.string,
  decimals: t.number,
};

EthBalance.defaultProps = {
  decimals: 18,
};

const StyledAccountRow = styled(Row)`
  align-items: center;

  a {
    color: ${props => props.theme.color.primary.default};
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

const StyledBalanceRow = styled(Row)`
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`;

const StyledEthLogo = styled(EthLogo)`
  flex: 2.4rem 0 0;
`;

const StyledBalanceDisplay = styled.span`
  color: ${props => props.theme.color.text.default};
  flex: auto 0 0;
  font-size: 2rem;
  line-height: 4rem;
  margin-left: 2rem;
`;

const StyledBalanceAlert = styled(Alert)`
  margin-top: 1rem;
  width: 100%;
`;

const StyledSection = styled.section`
  margin: 1rem 0;

  :last-child {
    margin-bottom: 0;
  }
`;

const StyledBalanceInnerContainer = styled.div`
  background-color: ${props => props.theme.color.background.default};
  border-radius: 0.75rem;
  padding: 1.5rem;
`;

const StyledBalanceTitle = styled(Typography.Title)`
  && {
    color: ${props => props.theme.color.text.default};
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: 400;
    text-align: center;
    margin-top: -0.5rem;
    margin-bottom: -0.5rem;
  }
`;
