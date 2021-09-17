import React from 'react';
import Icon from '@ant-design/icons';

const createCustomIcon = (IconComponent, BaseIcon = Icon) =>
  function CustomIcon(props) {
    return <BaseIcon component={IconComponent} {...props} />;
  };

export { createCustomIcon as default };
