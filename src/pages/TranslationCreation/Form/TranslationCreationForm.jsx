import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { Form, Row, Col, Divider, notification } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import * as r from '~/app/routes';
import { useWeb3React } from '~/app/web3React';
import ipfs from '~/app/ipfs';
import { useLinguoContract } from '~/api/linguo';
import useStateMachine from '~/hooks/useStateMachine';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import metaEvidenteTemplate from '~/assets/fixtures/metaEvidenceTemplate.json';
import Button from '~/components/Button';
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

const formStateMachine = {
  name: 'Translation Creation Form',
  initial: 'idle',
  states: {
    idle: {
      on: {
        SUBMIT: 'submitting',
      },
    },
    submitting: {
      on: {
        SUCCESS: 'succeeded',
        ERROR: 'failed',
      },
    },
    succeeded: {
      on: {
        RESET: 'idle',
      },
    },
    failed: {
      on: {
        RESET: 'idle',
      },
    },
  },
};

function TranslationCreationForm() {
  const history = useHistory();
  const [form] = Form.useForm();
  const [state, send] = useStateMachine(formStateMachine);
  const { account, library: web3, chainId } = useWeb3React();
  const linguo = useLinguoContract({ web3, chainId });

  const submitButtonProps =
    state === 'submitting'
      ? {
          icon: <LoadingOutlined />,
          disabled: true,
          children: 'Submitting...',
        }
      : {
          children: 'Request the translation',
        };

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

      const uploadedMetaEvidenceFile = await ipfs.publish('linguo-evidence.json', JSON.stringify(metaEvidence));

      if (linguo.isReady) {
        send('SUBMIT');
        try {
          await linguo.api.createTask({
            account,
            // deadline is a `dayjs` instance
            deadline: values.deadline.unix(),
            minPrice: web3.utils.toWei(String(values.minPrice), 'ether'),
            maxPrice: web3.utils.toWei(String(values.maxPrice), 'ether'),
            metaEvidence: uploadedMetaEvidenceFile.path,
          });
          send('SUCCESS');
          notification.success({
            placement: 'bottomRight',
            message: 'Translation submitted!',
          });
          history.push(r.TRANSLATION_DASHBOARD);
        } catch (err) {
          send('ERROR');
          notification.error({
            placement: 'bottomRight',
            message: 'Failed to submit the translation request!',
            description: err.cause?.message,
          });
        } finally {
          send('RESET');
        }
      } else {
        notification.error({
          placement: 'bottomRight',
          message: 'Not ready to submit the request translation yet!',
        });
      }
    },
    [account, web3, linguo.isReady, linguo.api, send, history]
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
          <Button {...submitButtonProps} htmlType="submit" />
        </Col>
      </Row>
    </StyledForm>
  );
}

export default TranslationCreationForm;
