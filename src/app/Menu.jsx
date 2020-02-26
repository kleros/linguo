import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Menu, Layout } from 'antd';
import * as r from './routes';

const MenuItems = [
  <Menu.Item key="request-translation">
    <NavLink to={r.TRANSLATION_MAIN}>Request Translation</NavLink>
  </Menu.Item>,
  <Menu.Item key="work-as-translator">
    <NavLink to={r.TRANSLATOR_MAIN}>Work as a Translator</NavLink>
  </Menu.Item>,
];

const StyledLayoutSider = styled(Layout.Sider)`
  height: 100%;
  position: fixed;
  z-index: 2000;

  @media (min-width: 768px) {
    display: none;
  }

  &.ant-layout-sider {
    background-color: #0043c5;

    .ant-menu-dark {
      background-color: transparent;
    }

    .ant-menu-item-selected {
      background-color: transparent;
    }

    .ant-layout-sider-zero-width-trigger {
      right: -50px;
      top: 12px;
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
`;

const StyledDrawerMenu = styled(Menu)`
  && {
    a {
      color: #fff;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

export const DrawerMenu = (
  <StyledLayoutSider breakpoint="md" collapsedWidth="0">
    <StyledDrawerMenu theme="dark">{MenuItems}</StyledDrawerMenu>
  </StyledLayoutSider>
);

const StyledMainMenu = styled(Menu)`
  line-height: 4rem;
  text-align: center;
  background: transparent;

  && {
    .ant-menu-item-selected {
      background-color: transparent;
    }

    a {
      color: #fff;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

export const MainMenu = (
  <StyledMainMenu mode="horizontal" theme="dark">
    <Menu.Item>
      <NavLink to={r.TRANSLATION_MAIN}>Request Translation</NavLink>
    </Menu.Item>
    <Menu.Item>
      <NavLink to={r.TRANSLATOR_MAIN}>Work as a Translator</NavLink>
    </Menu.Item>
  </StyledMainMenu>
);
