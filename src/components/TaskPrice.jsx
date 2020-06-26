import React from 'react';
import clsx from 'clsx';
import t from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import TokenValue from '~/features/tokens/TokenValue';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

function TaskPrice({ value, token, showTooltip, showFootnoteMark, className }) {
  return (
    <TokenValue
      address={token}
      amount={value}
      suffixType="short"
      render={({ formattedValue, suffix }) => (
        <Tooltip
          title={showTooltip ? <TokenValue address={token} amount={value} decimals={18} suffixType="short" /> : ''}
        >
          <StyledWrapper className={clsx({ 'with-tooltip': showTooltip }, className)}>
            {`${formattedValue} ${suffix}`.trim()}
            {showFootnoteMark ? <sup>*</sup> : null}
          </StyledWrapper>
        </Tooltip>
      )}
    />
  );
}

export default TaskPrice;

TaskPrice.propTypes = {
  value: t.any.isRequired,
  showTooltip: t.bool,
  showFootnoteMark: t.bool,
  className: t.string,
  token: t.string,
};

TaskPrice.defaultProps = {
  showTooltip: false,
  showFootnoteMark: false,
  className: '',
  token: ADDRESS_ZERO,
};

const StyledWrapper = styled.span`
  &.with-tooltip {
    cursor: help;
  }
`;
