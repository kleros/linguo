import React from 'react';
import clsx from 'clsx';
import t from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import EthValue from '~/components/EthValue';

const StyledWrapper = styled.span`
  &.with-tooltip {
    cursor: help;
  }
`;

function TaskPrice({ value, showTooltip, showFootnoteMark, className }) {
  return (
    <EthValue
      maxIntDigits={2}
      amount={value}
      suffixType="short"
      render={({ formattedValue, suffix }) => (
        <Tooltip title={showTooltip ? <EthValue amount={value} unit="ether" decimals={18} suffixType="short" /> : ''}>
          <StyledWrapper className={clsx({ 'with-tooltip': showTooltip }, className)}>
            {`${formattedValue} ${suffix}`.trim()}
            {showFootnoteMark ? <sup>*</sup> : null}
          </StyledWrapper>
        </Tooltip>
      )}
    />
  );
}

TaskPrice.propTypes = {
  value: t.any.isRequired,
  showTooltip: t.bool,
  showFootnoteMark: t.bool,
  className: t.string,
};

TaskPrice.defaultProps = {
  showTooltip: false,
  showFootnoteMark: false,
  className: '',
};

export default TaskPrice;
