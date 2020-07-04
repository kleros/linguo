import React from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { Form, Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useWeb3React } from '~/features/web3';
import { create as createTask } from '~/features/tasks/tasksSlice';
import useStateMachine from '~/features/shared/useStateMachine';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import Spacer from '~/components/Spacer';
import Button from '~/components/Button';
import TitleField from './TitleField';
import DeadlineField from './DeadlineField';
import PriceDefinitionFields from './PriceDefinitionFields';
import LanguagesSelectionFields from './LanguagesSelectionFields';
import ExpectedQualityField from './ExpectedQualityField';
import TextField from './TextField';
import OriginalSourceFields from './OriginalSourceFields';

function TranslationRequestForm() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [state, send] = useStateMachine(formStateMachine);
  const { account } = useWeb3React();

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
    async ({ originalTextFile, deadline, ...rest }) => {
      send('SUBMIT');
      const data = {
        account,
        deadline: new Date(deadline).toISOString(),
        originalTextFile: extractOriginalTextFilePath(originalTextFile),
        ...rest,
      };

      try {
        await dispatch(
          createTask(data, {
            meta: { redirect: true },
          })
        );
      } finally {
        send('RESET');
      }
    },
    [dispatch, account, send]
  );

  const handleFinishFailed = React.useCallback(
    ({ errorFields }) => {
      form.scrollToField(errorFields[0].name);
    },
    [form]
  );

  return (
    <StyledForm
      hideRequiredMark
      layout="vertical"
      form={form}
      initialValues={initialValues}
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
    >
      <Row gutter={rowGutter}>
        <LanguagesSelectionFields setFieldsValue={form.setFieldsValue} />
      </Row>
      <Row gutter={rowGutter}>
        <ExpectedQualityField initialValue={initialValues.expectedQuality} />
      </Row>
      <Spacer />
      <Row gutter={rowGutter}>
        <TitleField />
      </Row>
      <Spacer />
      <Row gutter={rowGutter}>
        <TextField />
      </Row>
      <Row gutter={rowGutter}>
        <OriginalSourceFields setFieldsValue={form.setFieldsValue} />
      </Row>
      <Row gutter={rowGutter}>
        <DeadlineField />
      </Row>
      <PriceDefinitionFields getFieldValue={form.getFieldValue} validateFields={form.validateFields} />
      <Spacer />
      <Row gutter={rowGutter} justify="end">
        <Col>
          <Button {...submitButtonProps} htmlType="submit" />
        </Col>
      </Row>
    </StyledForm>
  );
}

export default TranslationRequestForm;

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
        RESET: 'idle',
      },
    },
  },
};

const StyledForm = styled(Form)`
  && {
    .ant-input-number,
    .ant-picker {
      width: 100%;
    }
  }
`;
