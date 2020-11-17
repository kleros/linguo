import React from 'react';
import clsx from 'clsx';
import t from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import EthValue, { EthUnit } from '~/shared/EthValue';

function TaskPrice({ value, showTooltip, showFootnoteMark, className }) {
  return (
    <EthValue
      amount={value}
      suffixType="short"
      render={({ formattedValue, suffix }) => (
        <Tooltip
          title={showTooltip ? <EthValue amount={value} decimals={18} unit={EthUnit.ether} suffixType="short" /> : ''}
        >
          <>
            <StyledValueWrapper className={clsx({ 'with-tooltip': showTooltip }, className)}>
              {`${formattedValue} ${suffix}`.trim()}
              {showFootnoteMark ? <sup>*</sup> : null}
            </StyledValueWrapper>
          </>
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
};

TaskPrice.defaultProps = {
  showTooltip: false,
  showFootnoteMark: false,
  className: '',
};

const StyledValueWrapper = styled.span`
  display: block;
  &.with-tooltip {
    cursor: help;
  }
`;
