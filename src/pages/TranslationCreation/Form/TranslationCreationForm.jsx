import React from 'react';
import styled from 'styled-components';
import { Form, Row, Col, Divider } from 'antd';
import Button from '~/components/Button';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import TitleField from './TitleField';
import DeadlineField from './DeadlineField';
import PriceDefinitionFields from './PriceDefinitionFields';
import LanguagesSelectionFields from './LanguagesSelectionFields';
import ExpectedQualityField from './ExpectedQualityField';
import TextField from './TextField';
import OriginalSourceFields from './OriginalSourceFields';

const StyledForm = styled(Form)`
  && {
    .ant-input-number,
    .ant-picker {
      width: 100%;
    }
  }
`;

const StyledDivider = styled(Divider)`
  background: none;
`;

const rowGutter = [16, 16];

const initialValues = {
  expectedQuality: translationQualityTiers.standard.value,
};

function TranslationCreationForm() {
  const [form] = Form.useForm();

  const handleFinish = values => {
    console.log('Submitted form:', values);
  };

  return (
    <StyledForm hideRequiredMark layout="vertical" form={form} initialValues={initialValues} onFinish={handleFinish}>
      <Row gutter={rowGutter}>
        <TitleField />
      </Row>
      <Row gutter={rowGutter}>
        <DeadlineField />
      </Row>
      <Row gutter={rowGutter}>
        <PriceDefinitionFields />
      </Row>
      <StyledDivider />
      <Row gutter={rowGutter}>
        <LanguagesSelectionFields setFieldsValue={form.setFieldsValue} />
      </Row>
      <Row gutter={rowGutter}>
        <ExpectedQualityField initialValue={initialValues.expectedQuality} />
      </Row>
      <StyledDivider />
      <Row gutter={rowGutter}>
        <TextField />
      </Row>
      <Row gutter={rowGutter}>
        <OriginalSourceFields setFieldsValue={form.setFieldsValue} />
      </Row>
      <Row gutter={rowGutter} justify="end">
        <Col>
          <Button htmlType="submit">Request the Translation</Button>
        </Col>
      </Row>
    </StyledForm>
  );
}

export default TranslationCreationForm;
