import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Tabs, Typography } from 'antd';
import AntdButton from '~/adapters/antd/Button';
import * as r from '~/app/routes';
import { HelpIcon, SettingsIcon } from '~/shared/icons';
import Spacer from '~/shared/Spacer';
import { Popover } from './adapters';
import NetworkStatus from './NetworkStatus';
import SystemTrayButton from './SystemTrayButton';
import WalletBalance from './WalletBalance';
import WalletInformation from './WalletInformation';
import EmailNotifications from './EmailNotifications';

const { TabPane } = Tabs;

export default function Settings() {
  const [visible, setVisible] = React.useState(false);

  const handleVisibilityChange = React.useCallback(visible => {
    setVisible(visible);
  }, []);

  const handlePopoverDismissOnClick = React.useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <StyledPopover
      arrowPointAtCenter
      content={
        <StyledTabs defaultActiveKey="1" type="line">
          <TabPane key="1" tab="General">
            <GeneralSettings />
          </TabPane>
          <TabPane key="2" tab="E-mail">
            <EmailNotifications />
          </TabPane>
        </StyledTabs>
      }
      footer={
        <StyledHelperText>
          Any doubts?{' '}
          <Link to={r.FAQ} component={AntdButton} type="link" onClick={handlePopoverDismissOnClick}>
            Visit our FAQ <HelpIcon />
          </Link>
        </StyledHelperText>
      }
      title="Settings"
      placement="bottomRight"
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibilityChange}
    >
      <SystemTrayButton icon={<SettingsIcon />}></SystemTrayButton>
    </StyledPopover>
  );
}

function GeneralSettings() {
  return (
    <StyledGeneralSettings>
      <Spacer />
      <NetworkStatus />
      <Spacer size={2} />
      <WalletInformation />
      <Spacer size={2} />
      <WalletBalance />
    </StyledGeneralSettings>
  );
}

const StyledGeneralSettings = styled.div`
  text-align: center;
`;

const StyledPopover = styled(Popover)`
  width: 32rem;
`;

const StyledTabs = styled(Tabs)`
  && {
    .ant-tabs-nav-list {
      width: 100%;

      > .ant-tabs-tab {
        flex: 1;
        justify-content: center;
        font-weight: ${p => p.theme.fontWeight.semibold};
      }
    }
  }
`;

const StyledHelperText = styled(Typography.Text)`
  color: inherit;

  && {
    > .ant-btn-link {
      font-weight: ${p => p.theme.fontWeight.semibold};
      padding: 0;
    }
  }
`;
