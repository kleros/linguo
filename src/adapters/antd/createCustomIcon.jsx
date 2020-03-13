import React from 'react';
import Icon from '@ant-design/icons';

const createCustomIcon = (IconComponent, BaseIcon = Icon) => props => <BaseIcon component={IconComponent} {...props} />;

export { createCustomIcon as default };
