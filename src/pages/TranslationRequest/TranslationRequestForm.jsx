import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { Col, Form, Row } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import { create as createTask } from '~/features/tasks/tasksSlice';
import { fetchSupported as fetchSupportedTokens } from '~/features/tokens/tokensSlice';
import { selectAccount, selectChainId } from '~/features/web3/web3Slice';
import { omit } from '~/shared/fp';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import useStateMachine from '~/shared/useStateMachine';
import DeadlineField from './DeadlineField';
import ExpectedQualityField from './ExpectedQualityField';
import LanguagesSelectionFields from './LanguagesSelectionFields';
import OriginalSourceFields from './OriginalSourceFields';
import PriceDefinitionFields from './PriceDefinitionFields';
import TitleField from './TitleField';

dayjs.extend(utc);

function TranslationRequestForm() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [state, send] = useStateMachine(formStateMachine);
  const account = useSelector(selectAccount);
  const chainId = useSelector(selectChainId);

  React.useEffect(() => {
    dispatch(fetchSupportedTokens({ chainId }));
  }, [dispatch, chainId]);

  const submitButtonProps =
    state === 'submitting'
      ? {
          icon: <LoadingOutlined />,
          disabled: true,
          children: 'Submitting...',
        }
      : {
          children: 'Request the Translation',
        };

  const handleFinish = React.useCallback(
    async values => {
      const { originalTextFile, deadline, ...rest } = omit(['minPriceNumeric', 'maxPriceNumeric'], values);
      send('SUBMIT');
      const data = {
        ...rest,
        account,
        deadline: new Date(deadline).toISOString(),
        originalTextFile: extractOriginalTextFilePath(originalTextFile),
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
      <Spacer size={2} />
      <Row gutter={rowGutter}>
        <TitleField />
      </Row>
      <Row gutter={rowGutter}>
        <OriginalSourceFields setFieldsValue={form.setFieldsValue} />
      </Row>
      <Row gutter={rowGutter}>
        <DeadlineField setFieldsValue={form.setFieldsValue} />
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
