import React from 'react';
import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Menu, Layout } from 'antd';
import * as r from '~/app/routes';

const MenuItems = [
  <Menu.Item key="request-translation">
    <NavLink to={r.TRANSLATION_DASHBOARD}>Request a Translation</NavLink>
  </Menu.Item>,
  <Menu.Item key="work-as-translator">
    <NavLink to={r.TRANSLATOR_DASHBOARD}>Work as a Translator</NavLink>
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
    background-color: ${props => props.theme.primary.default};

    .ant-menu-dark {
      background-color: transparent;
    }

    .ant-menu-item-selected {
      background-color: transparent;
    }

    .ant-layout-sider-zero-width-trigger {
      right: -50px;
      top: 12px;
      background-color: ${props => props.theme.secondary.default};
    }
  }
`;

const menuAnchorMixin = css`
  && {
    a {
      font-size: 1rem;
      color: #fff;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const StyledDrawerMenu = styled(Menu)`
  ${menuAnchorMixin}
`;

export function DrawerMenu() {
  return (
    <StyledLayoutSider breakpoint="md" collapsedWidth="0">
      <StyledDrawerMenu theme="dark">{MenuItems}</StyledDrawerMenu>
    </StyledLayoutSider>
  );
}

const StyledMainMenu = styled(Menu)`
  line-height: 4rem;
  text-align: center;
  background: transparent;

  ${menuAnchorMixin}

  && {
    .ant-menu-item-selected {
      background-color: transparent;
    }
  }
`;

export function MainMenu() {
  return (
    <StyledMainMenu mode="horizontal" theme="dark">
      <Menu.Item>
        <NavLink to={r.TRANSLATION_DASHBOARD}>Request a Translation</NavLink>
      </Menu.Item>
      <Menu.Item>
        <NavLink to={r.TRANSLATOR_DASHBOARD}>Work as a Translator</NavLink>
      </Menu.Item>
    </StyledMainMenu>
  );
}
