import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Skeleton, Typography } from 'antd';
import { Alert } from '~/adapters/antd';
import EthLogo from '~/assets/images/logo-eth.svg';
import EthValue from '~/shared/EthValue';
import { useSelector, useDispatch } from 'react-redux';
import { selectBalance, selectAccount, getBalance } from '~/features/web3/web3Slice';

export default function WalletBalance() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const balance = useSelector(selectBalance(account));

  const [state, setState] = React.useState('idle');

  const fetchBalance = React.useCallback(async () => {
    setState('pending');
    try {
      await dispatch(getBalance({ account }, { meta: { thunk: { id: account } } }));
      setState('succeeded');
    } catch (err) {
      console.warn('Failed to get the account balance:', err);
      setState('failed');
    }
  }, [dispatch, account]);

  React.useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return account ? <EthBalance state={state} balance={balance} decimals={6} /> : null;
}

function EthBalance({ state, balance, decimals }) {
  return (
    <StyledBalanceWrapper>
      <StyledBalanceTitle level={3}>Balance</StyledBalanceTitle>
      {state === 'succeeded' ? (
        <StyledBalanceDisplay>
          <StyledEthLogo />
          <EthValue amount={balance} decimals={decimals} suffixType="short" />
        </StyledBalanceDisplay>
      ) : state === 'failed' ? (
        <StyledBalanceAlert showIcon type="warning" message="Failed to get the balance for the account" />
      ) : state === 'pending' ? (
        <Skeleton active paragraph={false} />
      ) : null}
    </StyledBalanceWrapper>
  );
}

EthBalance.propTypes = {
  state: t.oneOf(['idle', 'pending', 'succeeded', 'failed']).isRequired,
  balance: t.string,
  decimals: t.number.isRequired,
};

EthBalance.defaultProps = {
  balance: '0',
};

const StyledBalanceDisplay = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: ${p => p.theme.color.text.default};
  font-size: ${p => p.theme.fontSize.xl};
  line-height: 3rem;
`;

const StyledEthLogo = styled(EthLogo)`
  height: 2rem;
`;

const StyledBalanceAlert = styled(Alert)`
  text-align: left;
  margin-top: 1rem;
  width: 100%;
`;

const StyledBalanceWrapper = styled.div``;

const StyledBalanceTitle = styled(Typography.Title)`
  && {
    color: ${p => p.theme.color.text.default};
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: ${p => p.theme.fontWeight.regular};
    text-align: center;
    margin-bottom: -0.5rem;
  }
`;
