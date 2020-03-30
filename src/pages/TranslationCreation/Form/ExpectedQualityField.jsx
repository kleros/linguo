import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Form, Radio, Row, Col, Typography, Tag } from 'antd';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';

const StyledFormItem = styled(Form.Item)`
  width: 100%;

  .ant-form-item-label {
    text-align: center;
  }

  .ant-radio-group {
    width: 100%;
  }
`;

const StyledRadioButton = styled(Radio.Button)`
  &&& {
    &.ant-radio-button-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      height: 5.75rem;
      font-size: ${props => props.theme.fontSize.xl};
      font-weight: 400;
      border-radius: 0.75rem;
      color: ${props => props.theme.primary.default};
      border-color: ${props => props.theme.primary.default};
      background-color: ${props => props.theme.background.light};
      transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

      :hover,
      :focus,
      :active {
        background: ${props => props.theme.background.default};
      }

      :focus,
      :hover {
        box-shadow: 0 0.1875rem 0.375rem ${props => props.theme.shadow.ui};
      }

      @keyframes kickback {
        0% {
          transform: scale(1) translateY(0);
        }

        40% {
          transform: scale(0.99) translateY(1px);
        }

        100% {
          transform: scale(1) translateY(0);
        }
      }

      :active {
        box-shadow: none;
        animation: 0.25s kickback;
      }
    }

    &.ant-radio-button-wrapper-checked {
      color: ${props => props.theme.text.inverted};
      border: 0.3125rem solid ${props => props.theme.border.default};
      background-color: ${props => props.theme.primary.default};
      background-image: linear-gradient(
        118.61deg,
        ${props => props.theme.primary.default} 42.83%,
        ${props => props.theme.primary.dark} 89.23%
      );

      :hover,
      :focus,
      :active {
        background-color: ${props => props.theme.primary.default};
        background-image: linear-gradient(
          118.61deg,
          ${props => props.theme.primary.default} 42.83%,
          ${props => props.theme.primary.dark} 89.23%
        );
      }
    }
  }
`;

const StyledDefinitionWrapper = styled.div`
  margin-top: -1rem;
  padding: 1.5rem 2.5rem;
  background-color: ${props => props.theme.background.default};
  border-radius: 0.75rem;
`;

const StyledDefinitionTitle = styled(Typography.Title)`
  && {
    font-size: ${props => props.theme.fontSize.xl};
    font-weight: 400;
    color: ${props => props.theme.primary.default};
  }
`;

const StyledDefinitionText = styled(Typography.Text)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: 400;
    color: ${props => props.theme.text.default};
    display: block;

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

const tierDefinitionMap = Object.entries(translationQualityTiers).reduce(
  (acc, [key, tier]) =>
    Object.assign(acc, {
      [key]: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={16}>
            <StyledDefinitionTitle>{tier.name}</StyledDefinitionTitle>
            {tier.description.map((paragraph, index) => (
              <StyledDefinitionText key={index}>{paragraph}</StyledDefinitionText>
            ))}
          </Col>
          <Col xs={24} sm={24} md={8}>
            <StyledLevelTag>{tier.requiredLevel}</StyledLevelTag>
          </Col>
        </Row>
      ),
    }),
  {}
);

function ExpectedQualityField({ initialValue }) {
  const [expectedQuality, setExpectedQuality] = React.useState(initialValue);

  const handleChange = evt => {
    const { value } = evt.target;
    setExpectedQuality(value);
  };

  return (
    <Col span={24}>
      <StyledFormItem
        name="expectedQuality"
        label="Expected Quality"
        rules={[
          {
            required: true,
            message: 'Please choose the expected quality.',
          },
        ]}
      >
        <Radio.Group onChange={handleChange}>
          <Row gutter={[16, 16]} justify="center">
            {Object.entries(translationQualityTiers).map(([key, tier]) => (
              <Col span={8} key={key}>
                <StyledRadioButton value={tier.value}>{tier.name}</StyledRadioButton>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </StyledFormItem>
      <StyledDefinitionWrapper>{tierDefinitionMap[expectedQuality]}</StyledDefinitionWrapper>
    </Col>
  );
}

ExpectedQualityField.propTypes = {
  initialValue: t.oneOf(Object.keys(translationQualityTiers)).isRequired,
};

export default ExpectedQualityField;
