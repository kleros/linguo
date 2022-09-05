import React from 'react';
import styled, { css } from 'styled-components';
import { smallScreenStyle } from './smallScreenStyle';
import { Typography } from 'antd';
import PricingAnimation from '~/assets/gifs/pricing.gif';

const USE_CASES = ['Technical', 'Blockchain', 'Data for Machine Learning', 'Articles'];

const Pricing = () => (
  <Container>
    <Card>
      <HowPricingWorksContainer>
        <StyledTitle>How Pricing Works?</StyledTitle>
        <StyledBody>
          Linguo relies on a dynamic auction mechanism to help both parties reach a price they consider fair.
          Translation prices start at a set minimum price or $0 and keep increasing to the maximum price decided by the
          requester. Translators can pick up the job when the price reaches a level they consider acceptable.
        </StyledBody>
        <img src={PricingAnimation} />
      </HowPricingWorksContainer>
      <SpecializedTranslationsContainer>
        <StyledBody>Specialized translations use cases:</StyledBody>
        <LabelContainer>
          {USE_CASES.map((usecase, i) => (
            <Label key={i}>{usecase}</Label>
          ))}
          <LabelNoStyle>And More!</LabelNoStyle>
        </LabelContainer>
      </SpecializedTranslationsContainer>
    </Card>
  </Container>
);

const Container = styled.div`
  width: 100%;
  margin-top: 8rem;
  padding: 0 2rem;
`;

const Card = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 74rem;
`;

const HowPricingWorksContainer = styled.div`
  border-radius: 18px 18px 0 0;
  background-color: ${props => props.theme.color.landing.secondary};
  padding: 3rem;

  > img {
    ${smallScreenStyle(css`
      display: none;
    `)}
    margin-top: 2rem;
    width: 100%;
  }
`;

const StyledTitle = styled(Typography.Title)`
  && {
    text-align: left;
    font-size: 3rem;
    font-weight: ${p => p.theme.fontWeight.semibold};
    color: ${props => props.theme.color.text.inverted};
  }
`;

const StyledBody = styled(Typography.Text)`
  && {
    text-align: left;
    color: ${props => props.theme.color.text.inverted};
  }
`;

const SpecializedTranslationsContainer = styled.div`
  border-radius: 0 0 18px 18px;
  background-color: ${props => props.theme.color.primary.default};
  padding: 3rem;
`;

const LabelContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Label = styled(Typography.Text)`
  background-color: ${props => props.theme.color.landing.lightBlue};
  border-radius: 300px;
  padding: 0.5rem 1rem;
  color: ${props => props.theme.color.primary.default};
`;

const LabelNoStyle = styled(Typography.Text)`
  color: ${props => props.theme.color.text.inverted};
  padding: 0.5rem 1rem;
`;

export default Pricing;
