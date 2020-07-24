import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { List } from 'antd';
import TimeAgo from '~/shared/TimeAgo';
import ContentBlocker from '~/shared/ContentBlocker';
import { NotificationIcon, DisputeIcon, CheckIcon } from '~/shared/icons';
import { Popover, Button, Badge, withToolbarStylesIcon } from './adapters';

function Notifications() {
  const notifications = notificationFixtures;

  const renderItem = React.useCallback(data => <Notification {...data} id={data.key} />, []);

  return (
    <StyledPopover
      arrowPointAtCenter
      content={
        <>
          <ContentBlocker
            blocked
            contentBlur={2}
            overlayText={
              <div
                css={`
                  transform: rotate(-30deg);
                  color: ${p => p.theme.color.danger.default};
                  background-color: ${p => p.theme.color.background.light};
                  padding: 0.5rem 1rem;
                  border-radius: 0.75rem;
                  font-size: ${p => p.theme.fontSize.xxl};
                  text-align: center;
                  white-space: nowrap;
                `}
              >
                Coming soon...
              </div>
            }
          >
            <StyledList dataSource={notifications} loading={false} locale={locale} renderItem={renderItem} />
          </ContentBlocker>
        </>
      }
      placement="bottomRight"
      title="Notifications"
      trigger="click"
    >
      <span>
        <Badge count={notifications.length}>
          <Button shape="round">
            <StyledNotificationIcon />
          </Button>
        </Badge>
      </span>
    </StyledPopover>
  );
}

export default Notifications;

const locale = { emptyText: 'Wow. Such empty.' };

const notificationFixtures = [
  {
    account: '0x0000000000000000000000000000000000000000',
    date: new Date('2020-03-13T19:47:00.000Z'),
    icon: 'bell',
    key: '1',
    message: 'Jurors approved the translation. The Requester Deposit will be transfered to the translator.',
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
    message: 'The translator delivered the translation. It will be in the Review list for 3 days.',
    to: '/translation/1234',
    type: 'info',
  },
];

const StyledNotificationIcon = withToolbarStylesIcon(NotificationIcon);

const StyledPopover = styled(Popover)`
  width: 32rem;
`;

const StyledList = styled(List)`
  .ant-list-items {
    max-height: 50vh;
    overflow: hidden auto;
  }

  .ant-list-empty-text {
    color: ${props => props.theme.color.text.default};
    font-size: ${props => props.theme.fontSize.md};
    text-align: left;
    padding: 1rem 0;
  }
`;

function Notification({ id, date, message, to, type, icon }) {
  const ItemIcon = iconNameToIcon(icon);

  return (
    <StyledListItem>
      <List.Item.Meta
        avatar={<ItemIcon $type={type} />}
        description={<StyledTimeAgo $type={type} date={date} />}
        title={
          <Link id={id} to={to}>
            {message}
          </Link>
        }
      />
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

const typeToColor = (theme, type) => {
  const availableColors = {
    info: theme.color.secondary.default,
    warning: theme.color.warning.default,
    danger: theme.color.danger.default,
  };

  return availableColors[type] || theme.color.primary.default;
};

const iconNameToIcon = iconName => {
  const iconMap = {
    bell: BellItemIcon,
    dispute: DisputeItemIcon,
    confirmation: CheckOutlinedIcon,
  };

  return iconMap[iconName] || BellItemIcon;
};

const itemIconStyles = css`
  background-color: ${props => typeToColor(props.theme, props.$type)};
  color: ${props => props.theme.color.text.inverted};
  border-radius: 100%;

  svg {
    padding: 0.375rem;
    width: 1.75rem;
    height: 1.75rem;
  }
`;

const BellItemIcon = styled(NotificationIcon)`
  ${itemIconStyles}
`;

const DisputeItemIcon = styled(DisputeIcon)`
  ${itemIconStyles}
`;

const CheckOutlinedIcon = styled(CheckIcon)`
  ${itemIconStyles}
`;

const StyledListItem = styled(List.Item)`
  &.ant-list-item {
    padding: 1rem 0;
    border-bottom-color: ${props => props.theme.hexToRgba(props.theme.color.secondary.default, 0.25)};
  }

  .ant-list-item-meta-title {
    font-weight: 400;
    color: ${props => props.theme.color.text.default};

    > a {
      display: block;
      color: ${props => props.theme.color.text.light};

      &:hover,
      &:focus {
        color: ${props => props.theme.color.text.default};
      }
    }
  }

  .ant-list-item-meta-description {
    text-align: right;
    font-weight: 700;
  }
`;

const StyledTimeAgo = styled(TimeAgo)`
  color: ${props => typeToColor(props.theme, props.$type)};
`;
