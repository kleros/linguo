import React from 'react';
import t from 'prop-types';
import { Row, Col } from 'antd';
import BoxWrapper from '../components/BoxWrapper';
import StatusTitle from '../components/StatusTitle';
import StatusDescription from '../components/StatusDescription';
import IllustrationWrapper from '../components/IllustrationWrapper';
import InteractionWrapper from '../components/InteractionWrapper';

function VerticalSplitLayout({ title, description, interaction, illustration }) {
  return (
    <BoxWrapper>
      <Row
        gutter={[32, 32]}
        css={`
          margin-bottom: -16px !important;
        `}
      >
        <Col xs={24} sm={24} md={16}>
          <StatusTitle>{title}</StatusTitle>
          <StatusDescription items={description} />
        </Col>
        <Col xs={24} sm={24} md={8}>
          {illustration && <IllustrationWrapper>{illustration}</IllustrationWrapper>}
          {interaction && <InteractionWrapper>{interaction}</InteractionWrapper>}
        </Col>
      </Row>
    </BoxWrapper>
  );
}

VerticalSplitLayout.propTypes = {
  title: t.node.isRequired,
  description: t.node.isRequired,
  interaction: t.node,
  illustration: t.node,
};

export default VerticalSplitLayout;
