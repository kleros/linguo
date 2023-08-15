import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';
import { Typography } from 'antd';
import * as r from '~/app/routes';
import { smallScreenStyle } from './smallScreenStyle';
import TranslatorBackground from '~/assets/images/landing-translators.png';
import AvatarTaskAssigned from '~/assets/images/avatar-task-assigned.svg';
import TitleWithIcon from './TitleWithIcon';
import TextWithCheck from './TextWithCheck';
import StartNowCard from './StartNowCard';

const SENTENCES = [
  'Earn by translating documents.',
  "Earn by reviewing other people's translations.",
  'Flexibility to choose what you work on.',
];

const CARDS = [
  {
    title: 'Start working immediately',
    body: "Pick a request, pay the deposit and get started. No long tests, processes or interviews. You're in control.",
  },
  {
    title: 'No fees or hidden costs',
    body: "You keep 100% of your work. Linguo doesn't take a cut.",
  },
  {
    title: 'Multiple ways to earn',
    body: 'Use your skills to make translations yourself or review translations made by others.',
  },
  {
    title: 'Guaranteed payment',
    body: 'Once your translation is accepted, you will automatically receive your payment.',
  },
];

const Translators = () => (
  <Container>
    <Layout>
      <ImageLayout>
        <TextContainer>
          <TitleWithIcon title="For Translators" icon={AvatarTaskAssigned} />
          <SentenceContainer>
            {SENTENCES.map(sentence => (
              <TextWithCheck key={sentence} text={sentence} />
            ))}
          </SentenceContainer>
        </TextContainer>
        <ImageContainer />
      </ImageLayout>
      <BottomSection>
        <CardContainer>
          {CARDS.map(card => (
            <Card key={card.title} {...card} />
          ))}
        </CardContainer>
        <StartNowCard
          title="Start translating with Linguo now"
          buttonText="Start now"
          buttonURL={`${r.TRANSLATOR_DASHBOARD}?status=inReview&allTasks=true`}
        />
      </BottomSection>
    </Layout>
  </Container>
);

const Card = ({ title, body }) => (
  <BlueCard>
    <CardTitle>{title}</CardTitle>
    <CardSeparator />
    <CardBody>{body}</CardBody>
  </BlueCard>
);

Card.propTypes = {
  title: t.string.isRequired,
  body: t.string.isRequired,
};

const BlueCard = styled.div`
  width: 18rem;
  border-radius: 18px;
  background-color: ${props => props.theme.color.primary.default};
  padding: 1rem 1.5rem;

  ${smallScreenStyle(css`
    flex: 49%;
  `)}
`;

const CardTitle = styled(Typography.Title)`
  && {
    margin: 0px;
    color: ${props => props.theme.color.text.inverted};
    font-size: 2rem;
    font-weight: ${p => p.theme.fontWeight.semibold};
    text-align: left;
  }
`;

const CardBody = styled(Typography.Text)`
  && {
    text-align: left;
    font-size: ${props => props.theme.fontSize.xl};
    color: ${props => props.theme.color.text.inverted};
  }
`;

const CardSeparator = styled.hr`
  margin: 16px 0;
  width: 30%;
  height: 0px;
  background-color: ${props => props.theme.color.landing.secondary};
  border-color: ${props => props.theme.color.landing.secondary};
  border-style: solid;
  border-width: 3px;
  border-radius: 300px;
  margin-left: 0px;
`;

const BottomSection = styled.div`
  position: relative;
  bottom: 6rem;
  z-index: 2;
  ${smallScreenStyle(css`
    bottom: 1.75rem;
  `)}
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  ${smallScreenStyle(css`
    flex-wrap: wrap;
    gap: 1rem;
  `)}
`;

const Container = styled.div`
  width: 100%;
  margin-top: 8rem;
  padding: 0 2rem;
`;

const Layout = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 74rem;
`;

const ImageLayout = styled.div`
  position: relative;
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
`;

const TextContainer = styled.div`
  position: relative;
  z-index: 1;
  height: 600px;
  background-image: linear-gradient(
    99.71deg,
    ${props => props.theme.color.primary.default} 0%,
    rgba(0, 170, 255, 0) 67.49%
  );
  padding: 2rem;

  ${smallScreenStyle(css`
    min-height: 600px;
    height: auto;
    background-image: linear-gradient(
      128.74deg,
      ${props => props.theme.color.primary.default} 37.29%,
      rgba(0, 170, 255, 0) 98.43%
    );
  `)}
`;

const SentenceContainer = styled.div`
  margin-top: 3.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ImageContainer = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-image: url(${TranslatorBackground});
  background-position: 65% 100%;
`;

export default Translators;
