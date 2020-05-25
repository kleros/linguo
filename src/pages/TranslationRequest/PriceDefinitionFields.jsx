import React from 'react';
import styled from 'styled-components';
import { Form, Col, Typography } from 'antd';
import { InputNumberWithAddons } from '~/adapters/antd';
import { InfoIcon } from '~/components/icons';

const StyledDisclaimerText = styled(Typography.Text)`
  display: block;
  color: ${props => props.theme.color.text.default};
  font-size: ${props => props.theme.fontSize.small};
  font-weight: 400;
`;

function PriceDefinitionFields() {
  const [minMaxPrice, setMinMaxPrice] = React.useState(0.01);
  const handleMinPriceChange = value => {
    setMinMaxPrice(value);
  };

  return (
    <>
      <Col xs={24} sm={24} md={12}>
        <Form.Item
          label="Minimum Price"
          name="minPrice"
          rules={[
            {
              required: true,
              message: 'Please set a minimum price.',
            },
            {
              type: 'number',
              min: 0.01,
              message: 'Minimum price must be higher than 0.01 ETH.',
            },
          ]}
        >
          <InputNumberWithAddons
            placeholder="e.g.: 1.2"
            min={0.01}
            step={0.01}
            onChange={handleMinPriceChange}
            addonAfter="ETH"
          />
        </Form.Item>
      </Col>
      <Col xs={24} sm={24} md={12}>
        <Form.Item
          label="Maximum Price"
          name="maxPrice"
          dependencies={['minPrice']}
          rules={[
            {
              required: true,
              message: 'Please set a maximum price.',
            },
            {
              type: 'number',
              min: minMaxPrice,
              message: `Maximum price must be at least ${minMaxPrice} ETH.`,
            },
          ]}
        >
          <InputNumberWithAddons type="number" placeholder="e.g.: 2.5" min={minMaxPrice} step={0.01} addonAfter="ETH" />
        </Form.Item>
      </Col>
      <Col
        span={24}
        css={`
          margin-top: -1rem;
        `}
      >
        <StyledDisclaimerText>
          <InfoIcon /> The pricing is market based. The prices are automatically increased until a translator is found.
          This also sets the priority of the task.
        </StyledDisclaimerText>
      </Col>
    </>
  );
}

export default PriceDefinitionFields;
