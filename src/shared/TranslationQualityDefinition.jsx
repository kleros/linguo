import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Typography, Tag } from 'antd';
import translationQualityTiers from '../assets/fixtures/translationQualityTiers.json';

export default function TranslationQualityDefinition({ tierValue }) {
  const tier = translationQualityTiers[tierValue] || { name: '', description: [] };

  return (
    <StyledWrapper>
      <Row
        gutter={[32, 32]}
        css={`
          margin-bottom: -16px !important;
        `}
      >
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

const StyledWrapper = styled.div`
  padding: 2rem;
  background: ${p => p.theme.color.background.default};
  border: 1px solid ${p => p.theme.color.border.default};
  border-radius: 9px;
`;

const StyledTitle = styled(Typography.Title)`
  && {
    font-size: ${p => p.theme.fontSize.xxl};
    font-weight: ${p => p.theme.fontWeight.semibold};
    color: ${p => p.theme.color.text.default};
  }
`;

const StyledDescription = styled(Typography.Paragraph)`
  && {
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: ${p => p.theme.fontWeight.regular};
    color: ${p => p.theme.color.text.default};
    margin: 0;
  }
`;

const StyledLevelTag = styled(Tag)`
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  max-width: 10rem;
  height: 5rem;
  font-size: 3rem;
  font-weight: ${p => p.theme.fontWeight.semibold};
  color: ${p => p.theme.color.secondary.default};
  background: ${p => p.theme.color.background.light};
  border: 1px solid ${p => p.theme.color.border.default};
  border-radius: 9px;

  :hover {
    opacity: 1;
  }

  @media (max-width: 767.98px) {
    margin-right: auto;
  }
`;
