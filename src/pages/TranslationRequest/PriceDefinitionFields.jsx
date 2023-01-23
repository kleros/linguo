import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Col, Form, Input } from 'antd';
import { InputNumberWithAddons } from '~/adapters/antd';

import { InfoIcon } from '~/shared/icons';
import PriceDefinitionInfographic from '~/shared/PriceDefinitionInfographic';
import Spacer from '~/shared/Spacer';
import { getBestDisplayUnit } from '~/shared/EthValue';
import { useWeb3 } from '~/hooks/useWeb3';

export default function PriceDefinitionFieldsWrapper() {
  return (
    <Form.Item
      noStyle
      shouldUpdate={(prev, current) =>
        prev.sourceLanguage !== current.sourceLanguage || prev.targetLanguage !== current.targetLanguage
      }
    >
      {form => <PriceDefinitionFields {...form} />}
    </Form.Item>
  );
}

const MIN_REPRESENTABLE_VALUE = 0.000000000000000001;

function PriceDefinitionFields({ setFieldsValue, getFieldValue }) {
  const { account, chainId } = useWeb3();
  const displayUnit = getBestDisplayUnit({ chainId, amount: '0' }).suffix.short;

  const [minMaxPriceNumeric, setMinMaxPriceNumeric] = React.useState(MIN_REPRESENTABLE_VALUE);
  const handleMinPriceNumericChange = React.useCallback(
    value => {
      const parsedValue = Number.parseFloat(value);

      if (!Number.isNaN(parsedValue)) {
        setMinMaxPriceNumeric(Math.max(MIN_REPRESENTABLE_VALUE, parsedValue));

        const parsedMaxPriceNumeric = Number.parseFloat(getFieldValue('maxPriceNumeric') ?? 0);
        if (!Number.isNaN(parsedMaxPriceNumeric) && parsedValue > parsedMaxPriceNumeric) {
          setFieldsValue({ maxPriceNumeric: parsedValue });
        }
      }
    },
    [setFieldsValue, getFieldValue]
  );

  return (
    <>
      <Form.Item name="account" initialValue={account}>
        <Input type="hidden" />
      </Form.Item>
      <Col xs={24} sm={24} md={12} lg={8}>
        <Form.Item
          label="Maximum Price"
          name="maxPriceNumeric"
          dependencies={['minPriceNumeric']}
          rules={[
            {
              required: true,
              message: 'Please set a maximum price.',
            },
            {
              type: 'number',
              min: minMaxPriceNumeric,
              message: `Maximum price must be at least ${minMaxPriceNumeric} ${displayUnit}`,
            },
          ]}
        >
          <InputNumberWithAddons
            type="number"
            placeholder="e.g.: 2.5"
            min={minMaxPriceNumeric}
            step={0.01}
            addonAfter={displayUnit}
          />
        </Form.Item>
      </Col>
      <Col xs={24} sm={24} md={12} lg={8}>
        <Form.Item
          label="Minimum Price"
          name="minPriceNumeric"
          rules={[
            {
              type: 'number',
              min: 0.0,
              message: `Minimum price must be non-negative.`,
            },
          ]}
        >
          <InputNumberWithAddons
            type="number"
            placeholder="e.g.: 1.2"
            min={0.0}
            step={0.01}
            addonAfter={displayUnit}
            onChange={handleMinPriceNumericChange}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <StyledDetails>
          <summary>
            <InfoIcon /> Click to learn more about the price definition.
          </summary>
          <Spacer />
          <PriceDefinitionInfographic />
        </StyledDetails>
      </Col>
    </>
  );
}

PriceDefinitionFields.propTypes = {
  setFieldsValue: t.func.isRequired,
  getFieldValue: t.func.isRequired,
};

const StyledDetails = styled.details`
  &[open] {
    > summary {
      color: ${p => p.theme.color.text.default};
    }
  }

  > summary {
    cursor: help;
    outline: none;
    transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
    color: ${p => p.theme.color.text.light};

    &:focus,
    &:hover {
      color: ${p => p.theme.color.text.default};
    }

    &::-webkit-details-marker {
      display: none;
    }

    ::marker {
      display: none;
      content: '';
    }
  }
`;
