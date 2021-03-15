import React from 'react';
import { findDOMNode } from 'react-dom';
import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Menu, Layout } from 'antd';
import * as r from '~/app/routes';

export function DrawerMenu() {
  const componentRef = React.useRef(null);
  const nodeRef = React.useRef(null);

  React.useEffect(() => {
    /**
     * We want to collapse the menu if users click outside of its boundaries.
     *
     * Antd Sider does not expose refs, so it is not possible to get the
     * actual elements without resorting to findDOMNode.
     */
    /* eslint-disable-next-line react/no-find-dom-node */
    nodeRef.current = findDOMNode(componentRef.current);
  }, []);

  const closeOnClickOutsideMenu = React.useCallback(() => {
    if (nodeRef.current) {
      const menu = nodeRef.current;
      const trigger = nodeRef.current.querySelector('.ant-layout-sider-zero-width-trigger');
      const isCollapsed = [...menu.classList].includes('ant-layout-sider-collapsed');

      if (trigger && !isCollapsed) {
        trigger.click();
      }
    }
  }, []);

  useOnClickOutside(nodeRef, closeOnClickOutsideMenu);

  return (
    <StyledLayoutSider breakpoint="md" collapsedWidth={0} ref={componentRef}>
      <StyledDrawerMenu>{menuItems}</StyledDrawerMenu>
    </StyledLayoutSider>
  );
}

export function MainMenu() {
  return <StyledMainMenu mode="horizontal">{menuItems}</StyledMainMenu>;
}

const menuItems = [
  <Menu.Item key="request-translation">
    <NavLink to={r.REQUESTER_DASHBOARD}>Request Translations</NavLink>
  </Menu.Item>,
  <Menu.Item key="work-as-translator">
    <NavLink
      to={{
        pathname: r.TRANSLATOR_DASHBOARD,
        search: 'status=open',
      }}
    >
      Work as a Translator
    </NavLink>
  </Menu.Item>,
];

const StyledLayoutSider = styled(Layout.Sider)`
  height: 100%;
  position: fixed;
  z-index: 500;

  @media (min-width: 768px) {
    display: none;
  }

  &.ant-layout-sider {
    background-color: ${props => props.theme.color.primary.default};
    width: 80vw;

    .ant-menu {
      background-color: transparent;
      border-right: none;
    }

    .ant-menu-item {
      background: transparent;
    }

    .ant-menu-item-selected {
      background: ${props => props.theme.color.primary.default};
    }

    .ant-layout-sider-zero-width-trigger {
      top: 12px;
      right: -36px;
      background-color: ${props => props.theme.color.primary.default};
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;

      :hover {
        svg {
          filter: drop-shadow(0 0 2px ${p => p.theme.color.glow.default});
        }
      }
    }

    &.ant-layout-sider-collapsed {
      position: absolute;

      .ant-layout-sider-zero-width-trigger {
        border-radius: 2px;
        right: -50px;
        background-color: ${props => props.theme.color.primary.default};

        :hover {
          background-color: ${props => props.theme.color.secondary.default};
        }
      }
    }
  }
`;

const menuAnchorMixin = css`
  && {
    a {
      font-size: 1rem;
      color: ${p => p.theme.color.text.inverted};
      position: relative;
      display: inline-block;

      ::after {
        content: '';
        position: absolute;
        left: 16.67%;
        right: 16.67%;
        bottom: 50%;
        height: 1px;
        opacity: 0.75;
        background-image: linear-gradient(
          90deg,
          rgba(251, 251, 251, 0) 0%,
          currentColor 33.33%,
          currentColor 66.67%,
          rgba(251, 251, 251, 0) 100%
        );
        transform: scaleX(0) translateY(1rem);
        transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
      }

      :hover {
        color: ${p => p.theme.color.text.inverted};
        text-shadow: 0 0 5px ${p => p.theme.hexToRgba(p.theme.color.text.inverted, 0.5)};
      }

      &.active {
        font-weight: ${p => p.theme.fontWeight.semibold};
        text-shadow: 2px 0 1px ${p => p.theme.color.shadow.ui};

        ::after {
          transform: scaleX(1) translateY(1rem);
        }

        @media (min-width: 768px) {
          transform: scale(1.125);
        }
      }
    }
  }
`;

const StyledDrawerMenu = styled(Menu)`
  ${menuAnchorMixin}
`;

function useOnClickOutside(ref, handler) {
  React.useEffect(
    () => {
      const listener = event => {
        // Do nothing if clicking ref's element or descendent elements

        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }

        handler(event);
      };

      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);

      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    },

    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
}

const StyledMainMenu = styled(Menu)`
  line-height: 4rem;
  text-align: center;

  ${menuAnchorMixin}

  && {
    &.ant-menu {
      background: transparent;
      color: ${p => p.theme.color.text.inverted};
    }

    &.ant-menu-horizontal {
      border-bottom: none;
    }

    .ant-menu-item-selected {
      background-color: transparent;
    }

    .ant-menu-submenu-title {
      color: ${p => p.theme.color.text.inverted};

      :hover {
        color: ${p => p.theme.color.text.inverted};
        text-shadow: 0 0 5px ${p => p.theme.hexToRgba(p.theme.color.text.inverted, 0.25)};
      }
    }

    &.ant-menu-horizontal > .ant-menu-item {
      margin-top: 1px;
      top: 0;
      border: none;
    }
  }
`;
