import React from 'react';
import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Menu, Layout } from 'antd';
import * as r from '~/app/routes';

const MenuItems = [
  <Menu.Item key="request-translation">
    <NavLink to={r.REQUESTER_DASHBOARD}>My Translations</NavLink>
  </Menu.Item>,
  <Menu.Item key="work-as-translator">
    <NavLink to={r.TRANSLATOR_DASHBOARD}>Work as a Translator</NavLink>
  </Menu.Item>,
  <Menu.Item key="review-translations">
    <NavLink
      to={{
        pathname: r.TRANSLATOR_DASHBOARD,
        search: 'filter=inReview&secondLevelFilter=toReview',
      }}
    >
      Review Translations
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

    .ant-menu {
      background-color: transparent;
      border-right: none;
    }

    .ant-menu-item {
      background: transparent;
    }

    .ant-menu-item-selected {
      background: ${props => props.theme.color.secondary.default};
    }

    .ant-layout-sider-zero-width-trigger {
      top: 12px;
      right: -36px;
      background-color: ${props => props.theme.color.primary.default};
    }

    &.ant-layout-sider-collapsed {
      .ant-layout-sider-zero-width-trigger {
        right: -50px;
        background-color: ${props => props.theme.color.secondary.default};
      }
    }
  }
`;

const menuAnchorMixin = css`
  && {
    a {
      font-size: 1rem;
      color: ${p => p.theme.color.text.inverted};

      &:hover {
        color: ${p => p.theme.color.text.inverted};
        text-shadow: 0 0 5px ${p => p.theme.hexToRgba(p.theme.color.text.inverted, 0.25)};
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
      <StyledDrawerMenu>{MenuItems}</StyledDrawerMenu>
    </StyledLayoutSider>
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
  }
`;

export function MainMenu() {
  return (
    <StyledMainMenu mode="horizontal">
      <Menu.Item>
        <NavLink to={r.REQUESTER_DASHBOARD}>My Translations</NavLink>
      </Menu.Item>
      <Menu.Item>
        <NavLink to={r.TRANSLATOR_DASHBOARD}>Work as a Translator</NavLink>
      </Menu.Item>
      <Menu.Item>
        <NavLink
          to={{
            pathname: r.TRANSLATOR_DASHBOARD,
            search: 'filter=inReview&secondLevelFilter=toReview',
          }}
        >
          Review Translations
        </NavLink>
      </Menu.Item>
    </StyledMainMenu>
  );
}
