import React from 'react';
import { createCustomIcon } from '~/adapters/antd';
import _EmailIcon from '~/assets/images/icon-email.svg';
import { Popover, Button, Icon } from './adapters';

const EmailIcon = createCustomIcon(_EmailIcon, Icon);

function EmailNotifications() {
  return (
    <Popover
      arrowPointAtCenter
      overlayStyle={{
        width: '24rem',
      }}
      content={<div></div>}
      placement="bottomRight"
      title="Notify me by e-mail when:"
      trigger="click"
    >
      <Button shape="round">
        <EmailIcon />
      </Button>
    </Popover>
  );
}

export default EmailNotifications;
