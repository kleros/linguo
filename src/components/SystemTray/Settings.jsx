import React from 'react';
import { createCustomIcon } from '~/adapters/antd';
import _SettingsIcon from '~/assets/images/icon-settings.svg';
import { Popover, Button, Icon } from './adapters';

const SettingsIcon = createCustomIcon(_SettingsIcon, Icon);

function Settings() {
  return (
    <Popover
      arrowPointAtCenter
      overlayStyle={{
        width: '32rem',
      }}
      content={<div>Settings</div>}
      placement="bottomRight"
      trigger="click"
    >
      <Button shape="round">
        <SettingsIcon />
      </Button>
    </Popover>
  );
}

export default Settings;
