import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { List } from 'antd';
import { createCustomIcon } from '~/adapters/antd';
import TimeAgo from '~/components/TimeAgo';
import _NotificationIcon from '~/assets/images/icon-notification.svg';
import _DisputeIcon from '~/assets/images/icon-dispute.svg';
import _CheckIcon from '~/assets/images/icon-check.svg';
import { Popover, Button, Badge, Icon } from './adapters';

const notificationFixtures = [
  {
    account: '0x0000000000000000000000000000000000000000',
    date: new Date('2020-03-13T19:47:00.000Z'),
    icon: 'bell',
    key: '1',
    message: 'Jurors approved the translation. The escrow payment will be transfered to the translator.',
    to: '/translation/1234',
    type: 'info',
  },
  {
    account: '0x0000000000000000000000000000000000000000',
    date: new Date('2020-03-12T15:20:00.000Z'),
    icon: 'dispute',
    key: '2',
    message:
      'The translation was challenged. Now it goes to Kleros arbitration. When Jurors decide the case you will be informed.',
    to: '/translation/1234',
    type: 'warning',
  },
  {
    account: '0x0000000000000000000000000000000000000000',
    date: new Date('2020-03-11T22:02:00.000Z'),
    icon: 'confirmation',
    key: '3',
    message:
      'The translator delivered the translation. It will be in the Review list for X time before the escrow payment.',
    to: '/translation/1234',
    type: 'info',
  },
];

const typeToColor = (theme, type) => {
  const availableColors = {
    info: theme.secondary.default,
    warning: theme.warning.default,
    danger: theme.danger.default,
  };

  return availableColors[type] || theme.primary.default;
};

const itemIconStyles = css`
  background-color: ${props => typeToColor(props.theme, props.type)};
  border-radius: 100%;
  padding: 0.375rem;
  width: 1.75rem;
  height: 1.75rem;
  fill: white;
`;

const BellItemIcon = styled(_NotificationIcon)`
  ${itemIconStyles}
`;

const DisputeItemIcon = styled(_DisputeIcon)`
  ${itemIconStyles}
`;

const CheckOutlinedIcon = styled(_CheckIcon)`
  ${itemIconStyles}
`;

const iconNameToIcon = iconName => {
  const iconMap = {
    bell: BellItemIcon,
    dispute: DisputeItemIcon,
    confirmation: CheckOutlinedIcon,
  };

  return iconMap[iconName] || BellItemIcon;
};

const StyledTimeAgo = styled(TimeAgo)`
  color: ${props => typeToColor(props.theme, props.type)};
`;

const StyledListItem = styled(List.Item)`
  &.ant-list-item {
    padding: 1rem 0;
    border-bottom-color: ${props => props.theme.hexToRgba(props.theme.secondary.default, 0.25)};
  }

  .ant-list-item-meta-title {
    font-weight: 400;
    color: ${props => props.theme.text.default};
  }

  .ant-list-item-meta-description {
    text-align: right;
    font-weight: 700;
  }
`;

function Notification({ id, date, message, to, type, icon }) {
  const ItemIcon = iconNameToIcon(icon);

  return (
    <StyledListItem>
      <Link id={id} to={to}>
        <List.Item.Meta
          avatar={<ItemIcon type={type} />}
          description={<StyledTimeAgo type={type} date={date} />}
          title={message}
        />
      </Link>
    </StyledListItem>
  );
}

Notification.propTypes = {
  id: t.string.isRequired,
  date: t.oneOfType([t.instanceOf(Date), t.string]).isRequired,
  message: t.node,
  to: t.string,
  type: t.string,
  icon: t.string,
};

Notification.defaultProps = {
  message: '',
  to: '',
  type: '',
  icon: '',
};

const StyledPopover = styled(Popover)`
  width: 32rem;
`;

const StyledList = styled(List)`
  .ant-list-items {
    max-height: 50vh;
    overflow: hidden auto;
  }

  .ant-list-empty-text {
    color: ${props => props.theme.text.default};
    font-size: ${props => props.theme.fontSize.md};
    text-align: left;
    padding: 1rem 0;
  }
`;

const NotificationIcon = createCustomIcon(_NotificationIcon, Icon);

const locale = { emptyText: 'Wow. Such empty.' };

function Notifications() {
  const notifications = notificationFixtures;

  const renderItem = React.useCallback(data => <Notification {...data} id={data.key} />, []);

  return (
    <StyledPopover
      arrowPointAtCenter
      content={<StyledList dataSource={notifications} loading={false} locale={locale} renderItem={renderItem} />}
      placement="bottomRight"
      title="Notifications"
      trigger="click"
    >
      <Badge count={notifications.length}>
        <Button shape="round">
          <NotificationIcon />
        </Button>
      </Badge>
    </StyledPopover>
  );
}

export default Notifications;
