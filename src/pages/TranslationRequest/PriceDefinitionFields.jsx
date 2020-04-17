import React from 'react';
import styled from 'styled-components';
import { Form, Col, InputNumber, Typography } from 'antd';
import { InfoIcon } from '~/components/icons';

const StyledDisclaimerText = styled(Typography.Text)`
  display: block;
  color: ${props => props.theme.text.default};
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
          label="Min Price (ETH)"
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
          <InputNumber
            placeholder="Amount in ETH"
            size="large"
            min={0.01}
            step={0.01}
            onChange={handleMinPriceChange}
          />
        </Form.Item>
      </Col>
      <Col xs={24} sm={24} md={12}>
        <Form.Item
          label="Max Price (ETH)"
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
          <InputNumber placeholder="Amount in ETH" size="large" min={minMaxPrice} step={0.01} />
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
          This also take into account the urgency of tasks.
        </StyledDisclaimerText>
      </Col>
    </>
  );
}

export default PriceDefinitionFields;
