import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Tooltip } from 'antd';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Web3 from 'web3';
import FormattedNumber from '~/shared/FormattedNumber';
import Button from '~/shared/Button';
import { selectEthPrice, selectEthPriceState, fetchEthPrice } from '~/features/tokens/tokensSlice';
import { selectChainId } from '~/features/web3/web3Slice';
const { fromWei } = Web3.utils;

export default function TaskPriceFiat({ value, render }) {
  const dispatch = useDispatch();

  const chainId = useSelector(selectChainId);
  const ethPrice = useSelector(state => selectEthPrice(state, { chainId }));
  const ethPriceState = useSelector(state => selectEthPriceState(state, { chainId }));
  const priceInUsd = fromWei(value) * ethPrice;

  const handleFetchEthPrice = React.useCallback(() => {
    dispatch(fetchEthPrice({ chainId }));
  }, [dispatch, chainId]);

  return (
    <StyledWrapper>
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
        <StyledIconWrapper
          css={`
            right: -1.25rem;
          `}
        >
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

TaskPriceFiat.propTypes = {
  value: t.string.isRequired,
  render: t.func,
};

const StyledWrapper = styled.div`
  position: relative;
`;

const StyledIconWrapper = styled.span`
  position: absolute;
  top: 50%;
  right: -1rem;
  transform: translateY(-50%);
`;
