import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Layout, Row, Col } from 'antd';
import LinguoLogo from '~/assets/images/logo-linguo-white.svg';
import * as r from '~/app/routes';
import { MainMenu } from '~/shared/Menu';
import SystemTray from './SystemTray';

export default function Navbar() {
  return (
    <StyledHeader id="main-navbar">
      <Row gutter={16}>
        <Col md={{ span: 6, offset: 0 }} sm={{ span: 10, offset: 2 }} xs={0}>
          <StyledLogoWrapper>
            <NavLink to={r.HOME}>
              <StyledLinguoLogo />
              <span>by Kleros</span>
            </NavLink>
          </StyledLogoWrapper>
        </Col>
        <Col md={12} xs={0}>
          <MainMenu />
        </Col>
        <StyledToolbarCol md={6} sm={12} xs={24}>
          <SystemTray />
        </StyledToolbarCol>
      </Row>
    </StyledHeader>
  );
}

const StyledHeader = styled(Layout.Header)`
  height: 4rem;
  padding: 0 1.5rem;
  background-color: ${p => p.theme.color.primary.default};

  .ant-row,
  .ant-col {
    height: 100%;
  }
`;

const StyledLogoWrapper = styled.div`
  display: flex;

  > a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    color: ${p => p.theme.color.text.inverted};
    font-size: ${p => p.theme.fontSize.xs};

    > span {
      transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
    }

    :focus,
    :active,
    :hover {
      color: ${p => p.theme.color.text.inverted};

      > span {
        filter: drop-shadow(0 0 2px ${p => p.theme.color.glow.default});
      }
    }
  }
`;

const StyledLinguoLogo = styled(LinguoLogo)`
  max-width: 100%;
  height: 4rem;
  padding: 0.25rem 0;
`;

const StyledToolbarCol = styled(Col)`
  display: flex;
  justify-content: flex-end;
  line-height: 1;
`;
