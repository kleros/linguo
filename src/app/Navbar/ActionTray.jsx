import React from 'react';
import styled from 'styled-components';
import { Row, Button, Popover, Badge } from 'antd';
import Icon from '@ant-design/icons';
import createCustomIcon from '~/helpers/antd/createCustomIcon';
import Notifications from '~/assets/images/icon-notification.svg';
import Email from '~/assets/images/icon-email.svg';
import Settings from '~/assets/images/icon-settings.svg';

const StyledRow = styled(Row)`
  height: 4rem;
  display: grid;
  grid: 1fr / repeat(3, 1fr);
  column-gap: 0.75rem;
  justify-content: space-evenly;
  align-items: center;
`;

const StyledButton = styled(Button)`
  background: transparent;
  border: none;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0.125rem;

  :hover,
  :active,
  :focus {
    background: transparent;
    border: none;

    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
  }
`;

const StyledBadge = styled(Badge)`
  .ant-badge-count {
    z-index: 2;
    box-shadow: none;
    font-size: 0.675rem;
    font-weight: 500;
    padding: 0 0.2rem;
    min-width: 1rem;
    height: 1rem;
    line-height: 1.5;
    background-color: #009aff;
    margin-right: 0.25rem;
    margin-top: 0.25rem;
  }
`;

const StyledIcon = styled(Icon)`
  width: 1.25rem;
  height: 1.25rem;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const NotificationsIcon = createCustomIcon(Notifications, StyledIcon);
const EmailIcon = createCustomIcon(Email, StyledIcon);
const SettingsIcon = createCustomIcon(Settings, StyledIcon);

function ActionTray() {
  return (
    <StyledRow>
      <Popover
        arrowPointAtCenter
        overlayStyle={{
          width: '32rem',
        }}
        content={<div>There are no notifications</div>}
        placement="bottomRight"
        title="Notifications"
        trigger="click"
      >
        <StyledBadge count={3}>
          <StyledButton>
            <NotificationsIcon />
          </StyledButton>
        </StyledBadge>
      </Popover>
      <Popover
        arrowPointAtCenter
        content={<div></div>}
        placement="bottomRight"
        title="Notify me by e-mail when:"
        trigger="click"
      >
        <StyledButton>
          <EmailIcon />
        </StyledButton>
      </Popover>
      <Popover arrowPointAtCenter content={<div>Settings</div>} placement="bottomRight" trigger="click">
        <StyledButton>
          <SettingsIcon />
        </StyledButton>
      </Popover>
    </StyledRow>
  );
}

export default ActionTray;
