import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Tooltip } from 'antd';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Web3 from 'web3';
import FormattedNumber from '~/shared/FormattedNumber';
import Button from '~/shared/Button';
import { selectChainId } from '~/features/web3/web3Slice';
import { selectEthPrice, selectEthPriceState, fetchEthPrice } from './tokensSlice';
import supportedChainIds from './supportedChainIds';

const { fromWei } = Web3.utils;

export default function EthFiatValueWrapper(props) {
  const chainId = useSelector(selectChainId);

  return supportedChainIds[chainId] ? <EthFiatValue {...props} /> : null;
}

function EthFiatValue({ amount, render, className }) {
  const dispatch = useDispatch();

  const chainId = useSelector(selectChainId);
  const ethPrice = useSelector(state => selectEthPrice(state, { chainId }));
  const ethPriceState = useSelector(state => selectEthPriceState(state, { chainId }));
  const priceInUsd = fromWei(amount) * ethPrice;

  const handleFetchEthPrice = React.useCallback(() => {
    dispatch(fetchEthPrice({ chainId }));
  }, [dispatch, chainId]);

  return (
    <StyledWrapper className={className}>
      <FormattedNumber
        value={priceInUsd}
        decimals={2}
        style="currency"
        currency="USD"
        currencyDisplay="code"
        render={render}
      />
      {ethPriceState === 'loading' ? (
        <StyledIconWrapper>
          <SyncOutlined spin />
        </StyledIconWrapper>
      ) : ethPriceState === 'error' ? (
        <StyledIconWrapper>
          <Tooltip title="Price might be outdated. Click to update.">
            <Button variant="unstyled" onClick={handleFetchEthPrice}>
              <ExclamationCircleOutlined
                css={`
                  color: ${p => p.theme.color.warning.default};
                `}
              />
            </Button>
          </Tooltip>
        </StyledIconWrapper>
      ) : null}
    </StyledWrapper>
  );
}

EthFiatValue.propTypes = {
  amount: t.string.isRequired,
  render: t.func,
  className: t.string,
};

EthFiatValue.defaultProps = {
  className: '',
};

const StyledWrapper = styled.span`
  display: inline-block;
  position: relative;
`;

const StyledIconWrapper = styled.span`
  position: absolute;
  top: 50%;
  right: -1.5em;
  transform: translateY(-50%);
`;
