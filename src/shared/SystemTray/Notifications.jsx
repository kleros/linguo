import React from 'react';
import t from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { List, Skeleton, Button as AntdButton } from 'antd';
import {
  CloseOutlined as AntdCloseOutlinedIcon,
  CheckOutlined as AntdCheckOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { selectByAccount, markAsRead, markAllFromAccountAsRead } from '~/features/notifications/notificationsSlice';
import { selectAccount, selectBlockDate, getBlockInfo } from '~/features/web3/web3Slice';
import { CheckIcon, DisputeIcon, NotificationIcon } from '~/shared/icons';
import TimeAgo from '~/shared/TimeAgo';
import Spacer from '~/shared/Spacer';
import { Badge, Button, Popover, withToolbarStylesIcon } from './adapters';

export default function Notifications() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);

  const handleMarkAllAsRead = React.useCallback(() => {
    dispatch(markAllFromAccountAsRead({ account }));
  }, [dispatch, account]);

  const notifications = useShallowEqualSelector(state =>
    selectByAccount(state, {
      account,
      filter: notification => !notification.read,
    })
  );

  const sortedNotifications = React.useMemo(
    () =>
      [...notifications].sort((a, b) => {
        const blockDiff = b.blockNumber - a.blockNumber;
        return blockDiff !== 0 ? blockDiff : a.priority - b.priority;
      }),
    [notifications]
  );

  const { totalCount, handleLoadMore, currentList } = useLoadableList(sortedNotifications);
  const displayedCount = currentList.length;

  const renderItem = React.useCallback(
    ({ id, blockNumber, data }) => (
      <Notification
        id={id}
        blockNumber={blockNumber}
        message={data.text}
        to={data.url}
        type={data.type}
        icon={data.icon}
      />
    ),
    []
  );

  return (
    <StyledPopover
      arrowPointAtCenter
      content={
        <>
          {totalCount > 0 ? (
            <>
              <div
                css={`
                  text-align: right;
                `}
              >
                <AntdButton
                  css={`
                    padding: 0;
                  `}
                  onClick={handleMarkAllAsRead}
                  icon={<AntdCheckOutlined />}
                  type="link"
                >
                  Mark all as read
                </AntdButton>
              </div>
              <Spacer size={0.5} />
            </>
          ) : null}
          <StyledList dataSource={currentList} loading={false} locale={locale} renderItem={renderItem} />
          {totalCount > displayedCount ? (
            <>
              <Spacer />
              <AntdButton block onClick={handleLoadMore}>
                Load More
              </AntdButton>
            </>
          ) : null}
        </>
      }
      placement="bottomRight"
      title="Notifications"
      trigger="click"
    >
      <span>
        <Badge count={totalCount}>
          <Button shape="round">
            <StyledNotificationIcon />
          </Button>
        </Badge>
      </span>
    </StyledPopover>
  );
}

function useLoadableList(list, { initialCount = 10, additionalCount = initialCount } = {}) {
  const totalCount = list.length;
  const [displayCount, setDisplayCount] = React.useState(initialCount);

  const handleLoadMore = React.useCallback(() => {
    setDisplayCount(currentCount => currentCount + additionalCount);
  }, [additionalCount]);

  const currentList = React.useMemo(() => list.slice(0, displayCount), [list, displayCount]);

  return {
    currentList,
    totalCount,
    handleLoadMore,
  };
}

const locale = { emptyText: 'Wow, such empty!' };

const StyledNotificationIcon = withToolbarStylesIcon(NotificationIcon);

const StyledPopover = styled(Popover)`
  width: 32rem;
`;

const StyledList = styled(List)`
  .ant-list-items {
    max-height: 75vh;
    overflow: hidden auto;
  }

  .ant-list-empty-text {
    color: ${props => props.theme.color.text.default};
    font-size: ${props => props.theme.fontSize.md};
    text-align: center;
    padding: 1rem 0;
  }
`;

function Notification({ id, blockNumber, message, to, type, icon, transient }) {
  const account = useSelector(selectAccount);
  const dispatch = useDispatch();

  const handleClick = React.useCallback(() => {
    dispatch(markAsRead({ id, account }));
  }, [dispatch, id, account]);

  const blockDate = useBlockDate({ blockNumber });

  const ItemIcon = iconNameToIcon(icon);

  return (
    <StyledListItem>
      <List.Item.Meta
        avatar={<ItemIcon $type={type} />}
        description={
          blockDate ? (
            <StyledTimeAgo $type={type} date={blockDate} />
          ) : (
            <Skeleton.Button active size="small" shape="round" />
          )
        }
        title={
          <>
            {message} {transient ? <LoadingOutlined /> : null}
            <Link id={id} to={to}>
              {message}
            </Link>
          </>
        }
        onClick={handleClick}
      />
    </StyledListItem>
  );
}

Notification.propTypes = {
  id: t.string.isRequired,
  blockNumber: t.oneOfType([t.number, t.string]).isRequired,
  message: t.node,
  to: t.string,
  type: t.string,
  icon: t.string,
  transient: t.bool,
};

Notification.defaultProps = {
  message: '',
  to: '',
  type: '',
  icon: '',
  transient: false,
};

function useBlockDate({ blockNumber }) {
  const blockDate = useShallowEqualSelector(selectBlockDate(blockNumber));
  const hasBlockDate = blockDate !== null;

  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!hasBlockDate) {
      dispatch(getBlockInfo({ blockNumber }));
    }
  }, [dispatch, blockNumber, hasBlockDate]);

  return blockDate;
}

const typeToColor = (theme, type) => {
  const availableColors = {
    info: theme.color.secondary.default,
    warning: theme.color.warning.default,
    danger: theme.color.danger.default,
    success: theme.color.success.default,
  };

  return availableColors[type] || theme.color.secondary.default;
};

const iconNameToIcon = iconName => {
  const iconMap = {
    bell: BellItemIcon,
    dispute: DisputeItemIcon,
    confirmation: CheckOutlinedIcon,
    failure: CloseOutlinedIcon,
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

const CloseOutlinedIcon = styled(AntdCloseOutlinedIcon)`
  ${itemIconStyles}
`;

const StyledListItem = styled(List.Item)`
  &.ant-list-item {
    padding: 1rem 0;
    border-bottom-color: ${props => props.theme.hexToRgba(props.theme.color.secondary.default, 0.25)};
    position: relative;
  }

  .ant-list-item-meta-title {
    font-weight: ${p => p.theme.fontWeight.regular};
    color: ${props => props.theme.color.text.default};

    > a {
      text-indent: -999999px;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      opacity: 0.2;
      background-color: ${p => p.theme.color.background.light};
      transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

      &:hover,
      &:focus {
        opacity: 0;
      }
    }
  }

  .ant-list-item-meta-description {
    text-align: right;
    font-weight: ${p => p.theme.fontWeight.bold};
  }
`;

const StyledTimeAgo = styled(TimeAgo)`
  color: ${props => typeToColor(props.theme, props.$type)};
`;
