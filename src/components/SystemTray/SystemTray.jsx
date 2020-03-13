import React from 'react';
import styled from 'styled-components';
import { Row } from 'antd';
import Notifications from './Notifications';
import EmailNotifications from './EmailNotifications';
import Settings from './Settings';

const StyledRow = styled(Row)`
  height: 4rem;
  display: grid;
  grid: 1fr / repeat(3, 1fr);
  column-gap: 0.75rem;
  justify-content: space-evenly;
  align-items: center;
`;

function SystemTray() {
  return (
    <StyledRow>
      <Notifications />
      <EmailNotifications />
      <Settings />
    </StyledRow>
  );
}

export default SystemTray;
