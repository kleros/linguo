import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import { InputNumber } from 'antd';

function InputNumberWithAddons({ addonBefore, addonAfter, className, ...props }) {
  return (
    <div className="ant-input-group-wrapper">
      <div className="ant-input-wrapper ant-input-group">
        {addonBefore && <span className="ant-input-group-addon">{addonBefore}</span>}
        <InputNumber className={clsx('ant-input', className)} {...props} />
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
