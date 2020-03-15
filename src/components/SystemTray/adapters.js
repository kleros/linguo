import styled from 'styled-components';
import { Button, Badge } from 'antd';
import Icon from '@ant-design/icons';
import { StylablePopover } from '~/adapters/antd';

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
    filter: drop-shadow(0 0 2px ${({ theme }) => theme.glow.default});
  }
`;

export { StyledButton as Button };

const StyledBadge = styled(Badge)`
  .ant-badge-count {
    cursor: pointer;
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

export { StyledBadge as Badge };

const StyledIcon = styled(Icon)`
  width: 1.25rem;
  height: 1.25rem;

  svg {
    width: 100%;
    height: 100%;
    fill: ${props => props.theme.text.inverted};
  }
`;

export { StyledIcon as Icon };

const StyledPopover = styled(StylablePopover)`
  .ant-popover-arrow {
    background: ${props => props.theme.background.light};
    transform: scale(1.5) rotate(45deg);
  }

  .ant-popover-inner {
    border-radius: 0.75rem;
    padding: 1rem 2rem;
    box-shadow: 0 3px 6px -4px ${props => props.theme.shadow.default};
  }

  .ant-popover-title {
    color: ${props => props.theme.primary.default};
    border-bottom: 1px solid ${props => props.theme.secondary.default};
    font-size: ${props => props.theme.fontSize.lg};
    text-align: center;
    padding: 0 0 0.5rem;
  }

  .ant-popover-inner-content {
    padding-left: 0;
    padding-right: 0;
  }
`;

export { StyledPopover as Popover };
