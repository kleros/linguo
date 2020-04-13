import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { Form, Row, Col, Divider, notification } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import * as r from '~/app/routes';
import { useWeb3React } from '~/app/web3React';
import { useLinguo } from '~/api/linguo';
import useStateMachine from '~/hooks/useStateMachine';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
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

const extractOriginalTextFilePath = originalTextFile => {
  if (originalTextFile?.length > 0) {
    const { status, path } = originalTextFile[0].response || {};

    if (status === 'done' && !!path) {
      return path;
    }
  }

  return undefined;
};

const rowGutter = [16, 16];

const initialValues = {
  expectedQuality: translationQualityTiers.standard.value,
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
  const linguo = useLinguo({ web3, chainId });

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
    async ({ originalTextFile, ...rest }) => {
      if (linguo.error) {
        notification.error({
          placement: 'bottomRight',
          message: linguo.error.message || 'Not ready to submit the request translation yet!',
        });
        return;
      }

      send('SUBMIT');
      try {
        await linguo.api.createTask({
          account,
          originalTextFile: extractOriginalTextFilePath(originalTextFile),
          ...rest,
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
    },
    [account, linguo.error, linguo.api, send, history]
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
