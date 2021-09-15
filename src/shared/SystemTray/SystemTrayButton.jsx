import { Button } from 'antd';
import t from 'prop-types';
import React from 'react';
import styled from 'styled-components';

export default function SystemTrayButton({ icon, children, className, ...rest }) {
  return (
    <StyledButton {...rest} icon={icon} shape={icon && !children ? 'circle' : null} className={className}>
      {children}
    </StyledButton>
  );
}

SystemTrayButton.propTypes = {
  icon: t.node,
  children: t.node,
  className: t.string,
};

SystemTrayButton.deafultProps = {
  icon: null,
  children: null,
  className: '',
};

const StyledButton = styled(Button)`
  && {
    background: transparent;
    color: ${p => p.theme.color.background.light};
    transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

    :hover,
    :focus {
      filter: drop-shadow(0 0 2px ${p => p.theme.color.glow.default});
    }

    :active {
      transform: scale(0.95);
      filter: none;
    }

    &:not(.ant-btn-icon-only) {
      border-radius: 3px;
      height: 2rem;

      :hover,
      :focus {
        border-color: inherit;
      }

      @media (max-width: 767.98px) {
        line-height: 2.125;
        height: 2.5rem;
      }
    }

    &.ant-btn-icon-only {
      border: none;
      min-width: 1rem;
      width: 1rem;
      height: 1rem;
      padding: 0;

      @media (max-width: 767.98px) {
        width: 2.5rem;
        height: 2.5rem;
        padding: 0.5rem;
      }

      :hover,
      :focus,
      :active {
        border: none;
        background: transparent;
      }

      > .anticon,
      > .anticon > svg {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
  }
`;
