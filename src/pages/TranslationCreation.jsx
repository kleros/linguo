import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { Form, Row, Col, Input, InputNumber, Typography, Divider } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { DatePicker, createCustomIcon } from '~/adapters/antd';
import { LanguageSelect } from '~/components/LanguageSelect';
import languages from '~/assets/fixtures/languages';
import Button from '~/components/Button';
import _InfoIcon from '~/assets/images/icon-info.svg';
import SingleCardLayout from '~/pages/layouts/SingleCardLayout';

dayjs.extend(advancedFormat);

const StyledLanguageSelectionFormItem = styled(Form.Item)`
  @media (min-width: 576px) {
  }

  @media (min-width: 768px) {
    .ant-form-item-label {
      text-align: center;
    }
  }
`;

const StyledSwapButton = styled(Button)`
  && {
    width: 2rem;
    height: 2rem;
    background: ${props => props.theme.border.default};
    color: ${props => props.theme.primary.default};
    border-radius: 100%;
    padding: 0.25rem;

    @media (max-width: 767.98px) {
      transform: rotate(90deg) !important;
    }

    .anticon,
    .anticon > svg {
      width: 100%;
      height: 100%;
    }
  }
`;

function LanguageSelectionCombobox({ setFieldsValue }) {
  const [seletectedLanguages, setSelectedLanguages] = React.useState({
    source: undefined,
    target: undefined,
  });

  const handleSourceLanguageChange = value => {
    setSelectedLanguages(current => ({ ...current, source: value }));
  };

  const handleTargetLanguageChange = value => {
    setSelectedLanguages(current => ({ ...current, target: value }));
  };

  const availableSourceLanguages = React.useMemo(() => {
    return languages.filter(language => seletectedLanguages.target !== language.code);
  }, [seletectedLanguages.target]);

  const availableTargetLanguages = React.useMemo(() => {
    return languages.filter(language => seletectedLanguages.source !== language.code);
  }, [seletectedLanguages.source]);

  const handleSwapLanguages = () => {
    setSelectedLanguages({
      source: seletectedLanguages.target,
      target: seletectedLanguages.source,
    });
    setFieldsValue({
      sourceLanguage: seletectedLanguages.target,
      targetLanguage: seletectedLanguages.source,
    });
  };

  return (
    <Row
      gutter={[16, 16]}
      justify="center"
      css={`
        position: relative;
      `}
    >
      <Col xs={24} sm={24} md={11} lg={10}>
        <StyledLanguageSelectionFormItem
          name="sourceLanguage"
          label="Source Language"
          rules={[
            {
              required: true,
              message: 'Please select a source language',
            },
          ]}
        >
          <LanguageSelect
            placeholder="Choose..."
            options={availableSourceLanguages}
            onChange={handleSourceLanguageChange}
          />
        </StyledLanguageSelectionFormItem>
      </Col>
      <Col
        xs={24}
        sm={24}
        css={`
          display: flex;
          justify-content: center;
          align-items: center;

          @media (min-width: 768px) {
            position: absolute;
            top: 40%;
            z-index: 10;
          }
        `}
      >
        <StyledSwapButton variant="unstyled" onClick={handleSwapLanguages}>
          <SwapOutlined />
        </StyledSwapButton>
      </Col>
      <Col xs={24} sm={24} md={11} lg={10}>
        <StyledLanguageSelectionFormItem
          name="targetLanguage"
          label="Target Language"
          rules={[
            {
              required: true,
              message: 'Please select a target language',
            },
          ]}
        >
          <LanguageSelect
            placeholder="Choose..."
            options={availableTargetLanguages}
            onChange={handleTargetLanguageChange}
          />
        </StyledLanguageSelectionFormItem>
      </Col>
    </Row>
  );
}

LanguageSelectionCombobox.propTypes = {
  setFieldsValue: t.func.isRequired,
};

function isBefore1HourFromNow(current) {
  return !!current && dayjs(current) < dayjs().add(1, 'hour');
}

function isBeforeToday(current) {
  return !!current && dayjs(current) < dayjs().startOf('day');
}

const InfoIcon = createCustomIcon(_InfoIcon);

const StyledForm = styled(Form)`
  && {
    .ant-input-number,
    .ant-picker {
      width: 100%;
    }
  }
`;

const StyledDisclaimerText = styled(Typography.Text)`
  display: block;
  color: ${props => props.theme.text.default};
  font-size: ${props => props.theme.fontSize.small};
  font-weight: 400;
`;

const StyledDivider = styled(Divider)`
  background: none;
`;

function TranslationCreation() {
  const initialValues = {};
  const [form] = Form.useForm();

  const handleFinish = values => {
    console.log('Submitted form:', values);
  };

  const [minMaxPrice, setMinMaxPrice] = React.useState(0.01);
  const handleMinPriceChange = value => {
    setMinMaxPrice(value);
  };

  return (
    <SingleCardLayout title="New Translation">
      <StyledForm hideRequiredMark layout="vertical" form={form} initialValues={initialValues} onFinish={handleFinish}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Title"
              name="title"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Please provide a title.',
                },
              ]}
            >
              <Input size="large" placeholder="Translation Title" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col md={24} lg={12}>
            <Form.Item
              label="Deadline"
              name="deadline"
              rules={[
                {
                  required: true,
                  message: 'Please choose a deadline.',
                },
                {
                  validator: async (rule, value) => {
                    if (isBefore1HourFromNow(value)) {
                      throw new Error(rule.message);
                    }
                  },
                  message: 'Deadline must be at least 1 hour from now',
                },
              ]}
            >
              <DatePicker
                size="large"
                placeholder="Date and Hour of the Day"
                disabledDate={isBeforeToday}
                showToday={false}
                showNow={false}
                showTime={{
                  defaultValue: dayjs('00:00:00', 'HH'),
                  format: 'HH',
                  showNow: false,
                  use12Hours: false,
                }}
                format="MMMM Do[,] YYYY [at] HH:mm:ss [(Local Time)]"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
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
              <InfoIcon /> The pricing is market based. The prices are automatically increased until a translator is
              found. This also take into account the urgency of tasks.
            </StyledDisclaimerText>
          </Col>
        </Row>
        <StyledDivider />
        <LanguageSelectionCombobox setFieldsValue={form.setFieldsValue} />
        <Button htmlType="submit">Request the Translation</Button>
      </StyledForm>
    </SingleCardLayout>
  );
}

export default TranslationCreation;
