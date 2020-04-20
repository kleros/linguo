import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Typography, Tag } from 'antd';
import translationQualityTiers from '../assets/fixtures/translationQualityTiers.json';

const StyledWrapper = styled.div`
  padding: 1.5rem 2.5rem;
  background-color: ${props => props.theme.background.default};
  border-radius: 0.75rem;
`;

const StyledTitle = styled(Typography.Title)`
  && {
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: 500;
    color: ${props => props.theme.primary.default};
  }
`;

const StyledDescription = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: 400;
    color: ${props => props.theme.text.default};
    margin: 0;

    & + & {
      margin-top: 1rem;
    }
  }
`;

const StyledLevelTag = styled(Tag)`
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  user-select: none;
  width: 10rem;
  height: 6.5rem;
  font-size: 3rem;
  color: ${props => props.theme.text.inverted};
  background: linear-gradient(
    117.04deg,
    ${props => props.theme.secondary.default} 37.47%,
    ${props => props.theme.secondary.light} 94.76%
  );
  border: none;
  border-radius: 0.75rem;

  :hover {
    opacity: 1;
  }
`;

function TranslationQualityDefinition({ tierValue }) {
  const tier = translationQualityTiers[tierValue] || { name: '', description: [] };

  return (
    <StyledWrapper>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={16}>
          <StyledTitle level={3}>{tier.name}</StyledTitle>
          {tier.description.map((paragraph, index) => (
            <StyledDescription key={index}>{paragraph}</StyledDescription>
          ))}
        </Col>
        <Col xs={24} sm={24} md={8}>
          <StyledLevelTag>{tier.requiredLevel}</StyledLevelTag>
        </Col>
      </Row>
    </StyledWrapper>
  );
}

TranslationQualityDefinition.propTypes = {
  tierValue: t.oneOf(Object.keys(translationQualityTiers)).isRequired,
};

export default TranslationQualityDefinition;
