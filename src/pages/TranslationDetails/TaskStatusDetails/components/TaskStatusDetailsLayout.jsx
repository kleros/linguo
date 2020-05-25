import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import BoxWrapper from '../components/BoxWrapper';
import BoxTitle from '../components/BoxTitle';
import BoxParagraph from '../components/BoxParagraph';

function TaskStatusDetailsLayout({ title, description, interaction, illustration }) {
  return (
    <BoxWrapper variant="outlined">
      <Row
        gutter={[32, 32]}
        css={`
          margin-bottom: -16px !important;
        `}
      >
        <Col xs={24} sm={24} md={16}>
          <BoxTitle>{title}</BoxTitle>
          <StatusDescription items={description} />
        </Col>
        <Col xs={24} sm={24} md={8}>
          {illustration && <StyledIllustrationWrapper>{illustration}</StyledIllustrationWrapper>}
          {interaction && <StyledInteractionWrapper>{interaction}</StyledInteractionWrapper>}
        </Col>
      </Row>
    </BoxWrapper>
  );
}

TaskStatusDetailsLayout.propTypes = {
  title: t.node.isRequired,
  description: t.node.isRequired,
  interaction: t.node,
  illustration: t.node,
};

export default TaskStatusDetailsLayout;

const StyledIllustrationWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  > svg {
    width: 10rem;
  }

  @media (max-width: 767.98px) {
    justify-content: center;
  }
`;

const StyledInteractionWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;

  @media (max-width: 767.98px) {
    width: 50%;
    margin: 0 auto;
  }
`;

function StatusDescription({ items, className }) {
  return items.map((paragraph, index) => (
    <BoxParagraph key={index} className={className}>
      {paragraph}
    </BoxParagraph>
  ));
}

StatusDescription.propTypes = {
  items: t.arrayOf(t.node),
  className: t.string,
};

StatusDescription.defaultProps = {
  items: [],
  className: '',
};
