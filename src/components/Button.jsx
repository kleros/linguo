import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';
import { Button as BaseButton } from 'antd';

const sizeStyles = {
  small: css`
    font-size: ${props => props.theme.fontSize.xs};
    line-height: 1.15;
    min-height: 2rem;
  `,
  default: css`
    font-size: ${props => props.theme.fontSize.sm};
    line-height: 1.33;
    min-height: 2.5rem;
  `,
  large: css`
    font-size: ${props => props.theme.fontSize.xxl};
    line-height: 1.5;
    min-height: 4rem;
  `,
};

const StyledButtonContent = styled.span`
  max-width: 100%;
  vertical-align: middle;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const variantStyles = {
  unstyled: css`
    && {
      all: initial;
      cursor: pointer;

      [disabled],
      :disabled,
      [disabled]:hover,
      :disabled:hover {
        background: none;
        cursor: not-allowed;
      }
    }
  `,
  filled: css`
    border: none;
    color: ${props => props.theme.color.text.inverted};
    background-color: ${({ theme }) => theme.color.secondary.default};
    fill: currentColor;

    :active,
    :focus,
    :hover {
      background-color: ${({ theme }) => theme.color.secondary.default};
      color: ${props => props.theme.color.text.inverted};
    }

    position: relative;
    overflow: hidden;

    ::before,
    ::after {
      content: '';
      display: block;
      position: absolute;
      opacity: 1;
      z-index: 1;
      transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
      border-radius: 0;
      /*
       * There's some visual glitching under certain conditions
       * that are fixed by making the pseudo-elements slightly
       * bigger than the button itself.
       */
      top: -1px;
      right: -1px;
      bottom: -1px;
      left: -1px;
    }

    ::before {
      background-image: linear-gradient(
        260.5deg,
        ${({ theme }) => theme.color.secondary.default} 0%,
        ${({ theme }) => theme.color.primary.default} 100%
      );
      transform: translateX(-100%);
    }

    ::after {
      background-image: linear-gradient(
        99.5deg,
        ${({ theme }) => theme.color.secondary.default} 0%,
        ${({ theme }) => theme.color.primary.default} 100%
      );
      transform: translateX(0);
    }

    :hover::before {
      transform: translateX(0);
    }

    :hover::after {
      transform: translateX(100%);
    }

    > * {
      position: relative;
      z-index: 2;
      line-height: inherit;
    }

    &[disabled],
    &:disabled,
    &[disabled]:hover,
    &:disabled:hover {
      background-image: linear-gradient(99.5deg, #f2f2f2 0%, #e6e6e6 100%);
      color: #999;
    }

    &[disabled]::before,
    &[disabled]::after,
    &:disabled::before,
    &:disabled:after {
      display: none;
    }
  `,
  outlined: css`
    color: ${props => props.theme.color.primary.default};
    border: 1px solid ${props => props.theme.color.primary.default};
    background-color: ${props => props.theme.color.background.light};
    fill: currentColor;

    :active,
    :focus,
    :hover {
      color: ${props => props.theme.color.primary.default};
      background-color: ${props => props.theme.color.background.default};
      border-color: currentColor;
    }

    &[disabled],
    &:disabled,
    &[disabled]:hover,
    &:disabled:hover {
      background-color: #e9e9e9;
      color: #999;
    }
  `,
};

const StyledButton = styled(BaseButton)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  cursor: pointer;
  font-weight: 500;
  overflow: hidden;
  border-radius: 0.1875rem;
  padding: 0 1rem;
  transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
  text-decoration: none !important;

  &[disabled] {
    cursor: not-allowed;
  }

  :focus,
  :hover {
    box-shadow: 0 0.1875rem 0.375rem ${props => props.theme.color.shadow.ui};
  }

  :active {
    box-shadow: none;
  }

  ${props => sizeStyles[props.size]}
  ${props => variantStyles[props.variant]}

  > ${StyledButtonContent} {
    flex: 1;
  }

  > .anticon {
    flex: 0;
  }

  @keyframes kickback {
    0% {
      transform: scale(1) translateY(0);
    }

    40% {
      transform: scale(0.99) translateY(1px);
    }

    100% {
      transform: scale(1) translateY(0);
    }
  }

  &&[ant-click-animating-without-extra-node='true'] {
    animation: 0.25s kickback;
  }

  &&[ant-click-animating-without-extra-node]:after {
    animation: none !important;
  }
`;

function Button({ variant, size, color, fullWidth, children, ...props }) {
  return (
    <StyledButton {...props} variant={variant} size={size} color={color} block={fullWidth}>
      <StyledButtonContent>{children}</StyledButtonContent>
    </StyledButton>
  );
}

Button.propTypes = {
  variant: t.oneOf(['filled', 'outlined', 'unstyled']),
  size: t.oneOf(['small', 'default', 'large']),
  color: t.oneOf(['primary', 'secondary', 'primary-light', 'secondary-dark']),
  fullWidth: t.bool,
  children: t.node,
};

Button.defaultProps = {
  variant: 'filled',
  size: 'default',
  color: 'primary',
  fullWidth: false,
  children: null,
};

export default Button;
