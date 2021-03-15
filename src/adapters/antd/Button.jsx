import React from 'react';
import t from 'prop-types';
import { Button as AntdButton } from 'antd';

/**
 * Fixes the issue pointed out here:
 * @see {@link https://github.com/ReactTraining/react-router/issues/6962 }
 *
 * The native AntdDesign Button component passes all props down to the HTML element it generates,
 * causing a nasty red warning from react when used as the `component` prop of `Link` from `react-router-dom`.
 */
export default function Button({
  children,
  className,
  block,
  danger,
  disabled,
  ghost,
  href,
  htmlType,
  icon,
  loading,
  shape,
  size,
  target,
  type,
  onClick,
}) {
  return (
    <AntdButton
      className={className}
      block={block}
      danger={danger}
      disabled={disabled}
      ghost={ghost}
      href={href}
      htmlType={htmlType}
      icon={icon}
      loading={loading}
      shape={shape}
      size={size}
      target={target}
      type={type}
      onClick={onClick}
    >
      {children}
    </AntdButton>
  );
}

Button.propTypes = {
  children: t.node,
  className: t.string,
  block: t.bool,
  danger: t.bool,
  disabled: t.bool,
  ghost: t.bool,
  href: t.string,
  htmlType: t.string,
  icon: t.element,
  loading: t.oneOfType([
    t.bool,
    t.shape({
      delay: t.number.isRequired,
    }),
  ]),
  shape: t.oneOf(['circle', 'round']),
  size: t.oneOf(['large', 'middle', 'small']),
  target: t.string,
  type: t.string,
  onClick: t.func,
};

Button.defaultProps = {
  className: '',
  block: false,
  danger: false,
  disabled: false,
  ghost: false,
  htmlType: 'button',
  loading: false,
  size: 'middle',
  type: 'default',
};
