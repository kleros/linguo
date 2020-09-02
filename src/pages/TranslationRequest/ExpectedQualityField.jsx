import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Form, Radio, Row, Col } from 'antd';
import TranslationQualityDefinition from '~/shared//TranslationQualityDefinition';
import _allTranslationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';

/**
 * Remove the legacy value 'perfect' from the options.
 * This value is declared in the JSON for backward compatibility.
 */
const translationQualityTiers = Object.entries(_allTranslationQualityTiers).reduce(
  (acc, [key, data]) =>
    key !== 'perfect'
      ? Object.assign(acc, {
          [key]: data,
        })
      : acc,
  {}
);

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
      font-size: ${props => props.theme.fontSize.xxl};
      font-weight: ${p => p.theme.fontWeight.regular};
      border-radius: 0.75rem;
      color: ${props => props.theme.color.primary.default};
      border-color: ${props => props.theme.color.primary.default};
      background-color: ${props => props.theme.color.background.light};
      transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

      :hover,
      :focus,
      :active {
        background: ${props => props.theme.color.background.default};
      }

      :focus,
      :hover {
        box-shadow: 0 0.1875rem 0.375rem ${props => props.theme.color.shadow.ui};
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
      color: ${props => props.theme.color.text.inverted};
      border: 0.3125rem solid ${props => props.theme.color.border.default};
      background-color: ${props => props.theme.color.primary.default};
      background-image: linear-gradient(
        118.61deg,
        ${props => props.theme.color.primary.default} 42.83%,
        ${props => props.theme.color.primary.dark} 89.23%
      );

      :hover,
      :focus,
      :active {
        background-color: ${props => props.theme.color.primary.default};
        background-image: linear-gradient(
          118.61deg,
          ${props => props.theme.color.primary.default} 42.83%,
          ${props => props.theme.color.primary.dark} 89.23%
        );
      }
    }
  }
`;

const tierDefinitionMap = Object.entries(translationQualityTiers).reduce(
  (acc, [key, tier]) =>
    Object.assign(acc, {
      [key]: <TranslationQualityDefinition tierValue={tier.value} />,
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
              <Col xs={24} sm={24} md={8} key={key}>
                <StyledRadioButton value={tier.value}>{tier.name}</StyledRadioButton>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </StyledFormItem>
      {tierDefinitionMap[expectedQuality]}
    </Col>
  );
}

ExpectedQualityField.propTypes = {
  initialValue: t.oneOf(Object.keys(translationQualityTiers)).isRequired,
};

export default ExpectedQualityField;
