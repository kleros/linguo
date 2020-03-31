import React from 'react';
import styled from 'styled-components';
import { Form, Row, Col, Divider } from 'antd';
import Button from '~/components/Button';
import { useWeb3React } from '~/app/web3React';
import ipfs from '~/app/ipfs';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import metaEvidenteTemplate from '~/assets/fixtures/metaEvidenceTemplate.json';
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

const extractOriginalTextFilePath = originalTextFile => {
  if (originalTextFile?.length > 0) {
    const { status, path } = originalTextFile[0].response || {};

    if (status === 'done' && !!path) {
      return path;
    }
  }

  return undefined;
};

function TranslationCreationForm() {
  const [form] = Form.useForm();
  const { account, library: web3 } = useWeb3React();

  const handleFinish = React.useCallback(
    async values => {
      const metadata = {
        ...values,
        originalTextFile: extractOriginalTextFilePath(values.originalTextFile),
      };

      const metaEvidence = {
        ...metaEvidenteTemplate,
        aliases: {
          [account]: 'Requester',
        },
        metadata,
      };

      console.log(values.deadline);

      const uploadedMetaEvidenceFile = await ipfs.publish('linguo-evidence.json', JSON.stringify(metaEvidence));

      console.log('Will create a translation task with the following parameters:', {
        sender: account,
        value: web3.utils.toWei(String(values.maxPrice), 'ether'),
        // deadline is a `dayjs` instance
        deadline: values.deadline.unix(),
        minPrice: web3.utils.toWei(String(values.minPrice), 'ether'),
        metaEvidence: uploadedMetaEvidenceFile.path,
      });
    },
    [account, web3]
  );

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
