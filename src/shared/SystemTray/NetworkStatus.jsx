import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { Badge } from 'antd';
import { selectAccount, selectChainId, selectIsConnected, selectIsConnecting } from '~/features/web3/web3Slice';

export default function NetworkStatus({ textColor, accountRequired }) {
  const account = useSelector(selectAccount);
  const isConnecting = useSelector(selectIsConnecting);
  const isConnected = useSelector(selectIsConnected);
  const chainId = useSelector(selectChainId);

  const shouldDisplayInfo = accountRequired ? !!account : isConnected || isConnecting;

  return shouldDisplayInfo ? (
    <StyledBadge
      dot
      $textColor={textColor}
      status={isConnected ? 'success' : isConnecting ? 'warning' : 'default'}
      text={chainIdToNetworkName[chainId]}
    />
  ) : (
    <StyledBadge dot $textColor={textColor} status="error" text="Not Connected" />
  );
}

NetworkStatus.propTypes = {
  textColor: t.string,
  accountRequired: t.bool,
};

NetworkStatus.defaultProps = {
  textColor: '',
  accountRequired: true,
};

const chainIdToNetworkName = {
  42: 'Kovan',
  1: 'Mainnet',
};

const StyledBadge = styled(Badge)`
  && {
    width: auto;
    height: auto;

    .ant-badge-status-dot {
      width: 0.5rem;
      height: 0.5rem;
    }

    .ant-badge-status-text {
      color: ${p => (p.$textColor ? `${p.$textColor} !important` : 'currentColor')};
    }

    .ant-badge-status-success + .ant-badge-status-text {
      color: ${p => p.theme.color.success.default};
    }

    .ant-badge-status-error + .ant-badge-status-text {
      color: ${p => p.theme.color.danger.default};
    }

    .ant-badge-status-warning + .ant-badge-status-text {
      color: ${p => p.theme.color.warning.default};
    }
  }
`;
