import React from 'react';
import t from 'prop-types';
import { Popover } from 'antd';

function StylablePopover({ className, ...props }) {
  return <Popover overlayClassName={className} {...props} />;
}

StylablePopover.propTypes = {
  className: t.string,
};

StylablePopover.defaultProps = {
  className: '',
};

export default StylablePopover;
