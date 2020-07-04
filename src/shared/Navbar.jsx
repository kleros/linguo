import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Layout, Row, Col } from 'antd';
import LinguoLogo from '~/assets/images/logo-linguo-white.svg';
import * as r from '~/app/routes';
import { MainMenu } from '~/shared/Menu';
import SystemTray from './SystemTray';

const StyledHeader = styled(Layout.Header)`
  height: 4rem;
  padding: 0 1.5rem;
  background-image: linear-gradient(
    92.54deg,
    ${({ theme }) => theme.color.secondary.default} 0%,
    ${({ theme }) => theme.color.primary.default} 100%
  );

  .ant-row,
  .ant-col {
    height: 100%;
  }
`;

const StyledLinguoLogo = styled(LinguoLogo)`
  width: 100%;
  height: 4rem;
  padding: 0.25rem 0;
`;

const StyledToolbarCol = styled(Col)`
  display: flex;
  justify-content: flex-end;
  line-height: 1;
`;

const StyledLogoWrapper = styled.div`
  display: flex;
`;

function Navbar() {
  return (
    <StyledHeader id="main-navbar">
      <Row gutter={16}>
        <Col md={{ span: 4, offset: 0 }} sm={{ span: 10, offset: 2 }} xs={0}>
          <StyledLogoWrapper>
            <NavLink to={r.HOME}>
              <StyledLinguoLogo />
            </NavLink>
          </StyledLogoWrapper>
        </Col>
        <Col md={16} xs={0}>
          <MainMenu />
        </Col>
        <StyledToolbarCol md={4} sm={12} xs={24}>
          <SystemTray />
        </StyledToolbarCol>
      </Row>
    </StyledHeader>
  );
}

export default Navbar;
