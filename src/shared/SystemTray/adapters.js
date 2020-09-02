import styled from 'styled-components';
import { Button, Badge } from 'antd';
import Icon from '@ant-design/icons';
import { Popover } from '~/adapters/antd';

const StyledButton = styled(Button)`
  background: transparent;
  border: none;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0.125rem;
  transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

  :hover,
  :active,
  :focus {
    background: transparent;
    border: none;
    filter: drop-shadow(0 0 2px ${({ theme }) => theme.color.glow.default});
  }
`;

export { StyledButton as Button };

const StyledBadge = styled(Badge)`
  .ant-badge-count {
    cursor: pointer;
    z-index: 2;
    box-shadow: none;
    font-size: 0.675rem;
    font-weight: ${p => p.theme.fontWeight.semibold};
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
    fill: ${props => props.theme.color.text.inverted};
  }
`;

export { StyledIcon as Icon };

export const withToolbarStylesIcon = IconComponent => styled(IconComponent)`
  width: 1.25rem;
  height: 1.25rem;

  svg {
    width: 100%;
    height: 100%;
    fill: ${props => props.theme.color.text.inverted};
  }
`;

const StyledPopover = styled(Popover)`
  z-index: 300;
  .ant-popover-arrow {
    background: ${props => props.theme.color.background.light};
    transform: scale(1.5) rotate(45deg);
  }

  .ant-popover-inner {
    border-radius: 0.75rem;
    padding: 1rem 2rem;
    box-shadow: 0 3px 6px -4px ${props => props.theme.color.shadow.default};
  }

  .ant-popover-title {
    color: ${props => props.theme.color.primary.default};
    border-bottom: 1px solid ${props => props.theme.color.secondary.default};
    font-size: ${props => props.theme.fontSize.xl};
    font-weight: ${props => props.theme.fontWeight.semibold};
    text-align: center;
    padding: 0 0 0.5rem;
  }

  .ant-popover-inner-content {
    padding-left: 0;
    padding-right: 0;
  }

  @media (max-width: 575.98px) {
    width: 100%;

    .ant-popover-inner {
      border-radius: 0;
    }
  }
`;

export { StyledPopover as Popover };
