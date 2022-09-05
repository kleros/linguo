import React from 'react';
import { Typography } from 'antd';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import * as r from '~/app/routes';
import LogoLinguo from '~/assets/images/logo-linguo-homepage.svg';
import SecuredByKleros from '~/assets/images/logo-secured-by-kleros.svg';
import SymbolsBackground from '~/assets/images/background-symbols.png';
import Button from '~/shared/Button';
import { smallScreenStyle } from './smallScreenStyle';

const Hero = () => (
  <Container>
    <Layout>
      <TextContainer>
        <StyledTitle>The freelance translation platform for Web3</StyledTitle>
        <StyledSubtitle>Hire and make affordable and quality translations.</StyledSubtitle>
        <ButtonContainer>
          <Link to={r.REQUESTER_DASHBOARD}>
            <Button>Request translation</Button>
          </Link>
          <Link to={`${r.TRANSLATOR_DASHBOARD}?status=open`}>
            <Button>Work as a translator</Button>
          </Link>
          <Link to={`${r.TRANSLATOR_DASHBOARD}?status=inReview&allTasks=true`}>
            <Button>Review translations</Button>
          </Link>
        </ButtonContainer>
        <StyledSecuredByKleros />
      </TextContainer>
      <StyledLinguoLogo />
      <Symbols src={SymbolsBackground} />
    </Layout>
  </Container>
);

const Container = styled.div`
  background-color: ${props => props.theme.color.landing.lightBlue};
  width: 100%;
  padding: 0 2rem;
`;

const Layout = styled.div`
  position: relative;
  display: flex;
  max-width: 74rem;
  margin: 100px auto;
  ${smallScreenStyle(css`
    flex-direction: column;
    align-items: center;
    margin-bottom: 0px;
  `)};
`;

const Symbols = styled.img`
  position: absolute;
  width: 100%;
  bottom: -100px;
  ${smallScreenStyle(css`
    display: none;
  `)};
`;

const TextContainer = styled.div`
  flex-basis: 60%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
  ${smallScreenStyle(css`
    gap: 1.5rem;
  `)}
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  ${smallScreenStyle(css`
    flex-wrap: wrap;
    justify-content: center;
  `)};
`;

const StyledLinguoLogo = styled(LogoLinguo)`
  flex-basis: 40%;
  z-index: 1;
  ${smallScreenStyle(css`
    max-width: 480px;
  `)};
`;

const StyledTitle = styled(Typography.Title)`
  width: 75%;
  ${smallScreenStyle(css`
    width: 100%;
  `)};
  && {
    margin: 0px;
    color: ${props => props.theme.color.primary.default};
    font-size: 3rem;
    font-weight: ${p => p.theme.fontWeight.semibold};
    text-align: left;
  }
`;

const StyledSubtitle = styled(Typography.Title)`
  && {
    margin: 0px;
    color: ${props => props.theme.color.secondary.default};
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: ${p => p.theme.fontWeight.semibold};
    text-align: left;
  }
`;

const StyledSecuredByKleros = styled(SecuredByKleros)`
  height: 1.5rem;
`;

export default Hero;
