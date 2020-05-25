import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import styled from 'styled-components';
import { InputNumber } from 'antd';

function InputNumberWithAddons({ addonBefore, addonAfter, className, ...props }) {
  return (
    <div className="ant-input-group-wrapper">
      <div className="ant-input-wrapper ant-input-group">
        {addonBefore && <span className="ant-input-group-addon">{addonBefore}</span>}
        <StyledInputNumber className={clsx('ant-input', className)} {...props} />
        {addonAfter && <span className="ant-input-group-addon">{addonAfter}</span>}
      </div>
    </div>
  );
}

InputNumberWithAddons.propTypes = {
  addonBefore: t.node,
  addonAfter: t.node,
  className: t.string,
};

InputNumberWithAddons.defaultProps = {
  addonBefore: null,
  addonAfter: null,
  className: '',
};

export default InputNumberWithAddons;

const StyledInputNumber = styled(InputNumber)`
  &.ant-input-number-disabled {
    &,
    :hover,
    :focus {
      background-color: #f5f5f5;
    }

    :hover,
    :focus {
      border-color: #d9d9d9;
    }
  }

  .ant-input-number-input {
    padding-left: 0;
  }
`;
