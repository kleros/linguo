import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Badge } from 'antd';
import { getNetworkShortName } from '~/features/web3';
import { useWeb3 } from '~/hooks/useWeb3';
import { useConnect } from '~/hooks/useConnect';

export default function NetworkStatus({ textColor, accountRequired, className }) {
  const { account, chainId, active } = useWeb3();
  const { connecting } = useConnect();

  const shouldDisplayInfo = accountRequired ? !!account : active || connecting;
  return shouldDisplayInfo ? (
    <StyledBadge
      dot
      $textColor={textColor}
      status={active ? 'success' : connecting ? 'warning' : 'default'}
      text={getNetworkShortName(chainId)}
      className={className}
    />
  ) : (
    <StyledBadge dot $textColor={textColor} status="error" text="Not Connected" className={className} />
  );
}

NetworkStatus.propTypes = {
  textColor: t.string,
  accountRequired: t.bool,
  className: t.string,
};

NetworkStatus.defaultProps = {
  textColor: '',
  accountRequired: true,
  className: '',
};

const StyledBadge = styled(Badge)`
  && {
    display: flex;
    align-items: center;
    width: auto;
    height: auto;

    .ant-badge-status-dot {
      width: 0.5rem;
      height: 0.5rem;
      position: static;
    }

    .ant-badge-status-text {
      color: ${p => (p.$textColor ? `${p.$textColor} !important` : 'currentColor')};
      font-size: inherit;
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
