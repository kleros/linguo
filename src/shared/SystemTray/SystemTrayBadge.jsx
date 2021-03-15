import styled from 'styled-components';
import { Badge } from 'antd';

const SystemTrayBadge = styled(Badge)`
  .ant-badge-count,
  .ant-badge-dot {
    background-color: ${p => p.theme.color.secondary.default};
    cursor: pointer;
    z-index: 2;
    box-shadow: none;
    margin-right: 0.25rem;
    margin-top: 0.25rem;
  }

  .ant-badge-count {
    font-size: 0.675rem;
    font-weight: ${p => p.theme.fontWeight.semibold};
    padding: 0 0.2rem;
    min-width: 1rem;
    height: 1rem;
    line-height: 1.5;
  }

  .ant-badge-dot {
    width: 0.5rem;
    height: 0.5rem;
  }

  .ant-badge-status-text {
    color: ${p => p.theme.color.text.inverted};
  }

  > .ant-btn {
    display: block;
  }
`;

export default SystemTrayBadge;
