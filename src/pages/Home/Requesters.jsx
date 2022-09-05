import React from 'react';
import styled, { css } from 'styled-components';
import { smallScreenStyle } from './smallScreenStyle';
import * as r from '~/app/routes';
import RequesterBackground from '~/assets/images/landing-requester.png';
import AvatarRequestTranslation from '~/assets/images/avatar-request-translation.svg';
import TitleWithIcon from './TitleWithIcon';
import TextWithCheck from './TextWithCheck';
import StartNowCard from './StartNowCard';

const SENTENCES = [
  'Get documents translated without hassle.',
  'Upload your files and be notified when it is completed.',
  'Perfect quality translation, at a fair price each time.',
  'No need to know the languages you are translating to. Other translators check the quality of the translation for you.',
  'No need to know how much to pay for a translation. A reverse auction mechanism allows you to get the cheapest price.',
];

const Requesters = () => (
  <Container>
    <Layout>
      <TextAndImageLayout>
        <TextContainer>
          <TitleWithIcon title="For Requesters" icon={AvatarRequestTranslation} />
          <SentenceContainer>
            {SENTENCES.map((sentence, i) => (
              <TextWithCheck key={i} text={sentence} />
            ))}
          </SentenceContainer>
        </TextContainer>
        <ImageContainer />
      </TextAndImageLayout>
      <StartNowCard
        title="Start translating with Linguo now"
        buttonText="Start now"
        buttonURL={`${r.REQUESTER_DASHBOARD}`}
      />
    </Layout>
  </Container>
);

const Container = styled.div`
  width: 100%;
  margin-top: 8rem;
  padding: 0 2rem;
`;

const Layout = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 74rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const TextAndImageLayout = styled.div`
  width: 100%;
  display: flex;
  border-radius: 18px;
  overflow: hidden;
  ${smallScreenStyle(css`
    flex-direction: column;
  `)}
`;

const TextContainer = styled.div`
  flex: 50%;
  ${smallScreenStyle(css`
    height: auto;
  `)}
  background-color: ${props => props.theme.color.primary.default};
  padding: 2rem;
`;

const SentenceContainer = styled.div`
  margin-top: 3.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ImageContainer = styled.div`
  flex: 50%;
  min-height: 734px;
  background-image: url(${RequesterBackground});
  background-position: 55% 100%;
`;

export default Requesters;
