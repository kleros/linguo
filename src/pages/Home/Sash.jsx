import React from 'react';
import styled from 'styled-components';
import t from 'prop-types';
import { Typography } from 'antd';
import HexUpTrend from '~/assets/images/hex-uptrend.svg';
import HexGlobal from '~/assets/images/hex-global.svg';
import HexCommunity from '~/assets/images/hex-community.svg';
import Card from '~/shared/Card';

const CARDS = [
  {
    title: 'Affordable',
    text: 'An innovative mechanism ensuring fair prices for all parties.',
    icon: HexUpTrend,
  },
  {
    title: 'Reliable',
    text:
      'Translators can start working immediately after making a deposit. ' +
      'This gives them the incentive to only accept gigs they know they can ' +
      'complete on time.',
    icon: HexGlobal,
  },
  {
    title: 'High Quality',
    text:
      'Translations get reviewed by multiple people ensuring a high quality ' +
      'of output. Any disputes are efficiently resolved by Kleros.',
    icon: HexCommunity,
  },
];

const Sash = () => (
  <Container>
    <StyledTitle>Why Translate with Linguo?</StyledTitle>
    <Layout>
      {CARDS.map(card => (
        <SashCard key={card.title} {...card} />
      ))}
    </Layout>
  </Container>
);

const SashCard = ({ icon: Icon, title, text, className }) => (
  <StyledCard {...{ title, className }}>
    <SashCardLayout>
      <Icon />
      <SashCardBody>{text}</SashCardBody>
    </SashCardLayout>
  </StyledCard>
);

SashCard.propTypes = {
  title: t.node.isRequired,
  icon: t.func.isRequired,
  text: t.string.isRequired,
  className: t.node,
};

const Container = styled.div`
  width: 100%;
  margin-top: 8rem;
  padding: 0 2rem;
`;

const Layout = styled.div`
  margin: 6rem auto 0px auto;
  width: 100%;
  max-width: 74rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
`;

const StyledTitle = styled(Typography.Title)`
  && {
    margin: 0px;
    color: ${props => props.theme.color.primary.default};
    font-size: 3rem;
    font-weight: ${p => p.theme.fontWeight.semibold};
    text-align: center;
  }
`;

const StyledCard = styled(Card)`
  width: 22rem;
  border-radius: 18px;
  .card-header {
    border-radius: 18px 18px 0 0;
  }
  .card-header-title {
    font-size: ${props => props.theme.fontSize.xxl};
  }
`;

const SashCardLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0;
  gap: 1.5rem;
`;

const SashCardBody = styled(Typography.Text)`
  && {
    text-align: center;
    color: ${props => props.theme.color.text.secondary};
  }
`;

export default Sash;
