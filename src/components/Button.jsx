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
    font-size: ${props => props.theme.fontSize.xl};
    line-height: 1.5;
    min-height: 3rem;
  `,
};

const variantStyles = {
  filled: css`
    border: none;
    color: ${props => props.theme.text.inverted};
    background-color: ${({ theme }) => theme.secondary.default};
    fill: currentColor;

    :active,
    :focus,
    :hover {
      background-color: ${({ theme }) => theme.secondary.default};
      color: ${props => props.theme.text.inverted};
    }

    position: relative;
    overflow: hidden;

    ::before,
    ::after {
      content: '';
      display: block;
      position: absolute;
      opacity: 1;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1;
      transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
    }

    ::before {
      background-image: linear-gradient(
        260.5deg,
        ${({ theme }) => theme.secondary.default} 0%,
        ${({ theme }) => theme.primary.default} 100%
      );
      transform: translateX(-100%);
    }

    ::after {
      background-image: linear-gradient(
        99.5deg,
        ${({ theme }) => theme.secondary.default} 0%,
        ${({ theme }) => theme.primary.default} 100%
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
  `,
  outlined: css`
    color: ${props => props.theme.primary.default};
    border: 1px solid ${props => props.theme.primary.default};
    background-color: ${props => props.theme.background.light};
    fill: currentColor;

    :active,
    :focus,
    :hover {
      color: ${props => props.theme.primary.default};
      background-color: ${props => props.theme.background.default};
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
  height: auto;
  cursor: pointer;
  font-weight: 500;
  overflow: hidden;
  border-radius: 0.1875rem;
  padding: 0 1rem;
  transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

  &[disabled] {
    cursor: not-allowed;
  }

  :active,
  :focus,
  :hover {
    box-shadow: 0 0.1875rem 0.375rem ${props => props.theme.shadow.ui};
  }

  ${props => sizeStyles[props.size]}
  ${props => variantStyles[props.variant]}

  &&[ant-click-animating-without-extra-node]:after {
    animation: none !important;
  }
`;

function Button({ variant, size, color, fullWidth, ...props }) {
  return <StyledButton {...props} variant={variant} size={size} color={color} block={fullWidth} />;
}

Button.propTypes = {
  variant: t.oneOf(['filled', 'outlined']),
  size: t.oneOf(['small', 'default', 'large']),
  color: t.oneOf(['primary', 'secondary', 'primary-light', 'secondary-dark']),
  fullWidth: t.bool,
};

Button.defaultProps = {
  variant: 'filled',
  size: 'default',
  color: 'primary',
  fullWidth: false,
};

export default Button;
