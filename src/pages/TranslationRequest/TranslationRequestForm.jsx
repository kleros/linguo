import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { Col, Form, Row } from 'antd';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import { create as createTask } from '~/features/tasks/tasksSlice';
import { fetchAll } from '~/features/tokens/tokensSlice';
import { selectAccount, selectChainId } from '~/features/web3/web3Slice';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import useStateMachine from '~/shared/useStateMachine';
import DeadlineField from './DeadlineField';
import ExpectedQualityField from './ExpectedQualityField';
import LanguagesSelectionFields from './LanguagesSelectionFields';
import OriginalSourceFields from './OriginalSourceFields';
import PriceDefinitionFields from './PriceDefinitionFields';
import TextField from './TextField';
import TitleField from './TitleField';

function TranslationRequestForm() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [state, send] = useStateMachine(formStateMachine);
  const account = useSelector(selectAccount);
  const chainId = useSelector(selectChainId);

  React.useEffect(() => {
    dispatch(fetchAll({ chainId }));
  }, [dispatch, chainId]);

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
            meta: {
              thunk: true,
              redirect: true,
            },
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
      <PriceDefinitionFields />
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
