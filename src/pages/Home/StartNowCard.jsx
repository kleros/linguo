import React from 'react';
import styled from 'styled-components';
import t from 'prop-types';
import LinguoLogo from '~/assets/images/avatar-linguo-bot.svg';
import ArrowIcon from '~/assets/images/icon-arrow.svg';
import { Typography } from 'antd';
import Button from '~/shared/Button';
import { Link } from 'react-router-dom';

const StartNowCard = ({ title, buttonText, buttonURL }) => (
  <Card>
    <LinguoWithTitle {...{ title }} />
    <LearnMoreAndButton {...{ buttonText, buttonURL }} />
  </Card>
);

StartNowCard.propTypes = {
  title: t.string.isRequired,
  buttonText: t.string.isRequired,
  buttonURL: t.string.isRequired,
};

const Card = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  gap: 1rem;
  background-color: ${props => props.theme.color.landing.secondary};
  border-radius: 18px;

  .linguo-with-title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    > svg {
      height: 3rem;
      flex-shrink: 0;
    }
  }
  .learn-more-and-button {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
    .learn-more-and-arrow {
      display: flex;
      gap: 0.25rem;
      align-items: center;
      > svg {
        flex-shrink: 0;
        width: 0.8rem;
      }
    }
  }
`;

const LinguoWithTitle = ({ title }) => (
  <span className="linguo-with-title">
    <LinguoLogo />
    <Title>{title}</Title>
  </span>
);

LinguoWithTitle.propTypes = {
  title: t.string.isRequired,
};

const LearnMoreAndButton = ({ buttonText, buttonURL }) => (
  <span className="learn-more-and-button">
    <Link to={{ pathname: 'https://kleros.gitbook.io/docs/products/linguo' }} target="_blank" rel="noreferer noopener">
      <span className="learn-more-and-arrow">
        <Text>Learn more</Text>
        <ArrowIcon />
      </span>
    </Link>
    <Link to={buttonURL}>
      <Button>{buttonText}</Button>
    </Link>
  </span>
);

LearnMoreAndButton.propTypes = {
  buttonText: t.string.isRequired,
  buttonURL: t.string.isRequired,
};

const Title = styled(Typography.Title)`
  && {
    margin: 0px;
    color: ${props => props.theme.color.text.inverted};
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: ${p => p.theme.fontWeight.bold};
    text-align: left;
  }
`;

const Text = styled(Typography.Text)`
  && {
    font-size: ${props => props.theme.fontSize.md};
    color: ${props => props.theme.color.text.inverted};
    weight: ${props => props.theme.fontWeight.regular};
  }
`;

export default StartNowCard;
