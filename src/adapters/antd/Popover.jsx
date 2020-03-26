import React from 'react';
import t from 'prop-types';
import { Popover as BasePopover } from 'antd';

function Popover({ className, ...props }) {
  return <BasePopover overlayClassName={className} {...props} />;
}

Popover.propTypes = {
  className: t.string,
};

Popover.defaultProps = {
  className: '',
};

export default Popover;
