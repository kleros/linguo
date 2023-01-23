import React, { useEffect } from 'react';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { Form, Row, Steps } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import { normalizeBaseUnit } from '~/features/tokens';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import AffixContainer from '~/shared/AffixContainer';
import useStateMachine from '~/shared/useStateMachine';
import DeadlineField from './DeadlineField';
import ExpectedQualityField from './ExpectedQualityField';
import LanguagesSelectionFields from './LanguagesSelectionFields';
import OriginalSourceFields from './OriginalSourceFields';
import PriceDefinitionFields from './PriceDefinitionFields';
import TitleField from './TitleField';
import { useWeb3 } from '~/hooks/useWeb3';
import { useLinguoApi } from '~/hooks/useLinguo';
import { getAddressByLanguageAndChain } from '~/utils/getAddressByLanguage';
import { publishMetaEvidence } from '~/utils/task/publishMetaEvidence';
import moment from 'moment';

dayjs.extend(utc);

function TranslationRequestForm() {
  const { account, chainId } = useWeb3();
  const { createTask, setAddress } = useLinguoApi();
  const [form] = Form.useForm();
  const [state, send] = useStateMachine(formStateMachine);

  const sourceLanguage = form.getFieldValue('sourceLanguage');
  const targetLanguage = form.getFieldValue('targetLanguage');
  const getLang = langCode => langCode.split('-')[0];

  useEffect(() => {
    if (!sourceLanguage && !targetLanguage) return;

    const lang = `${getLang(sourceLanguage)}|${getLang(targetLanguage)}`;
    const address = getAddressByLanguageAndChain(lang, chainId);
    setAddress(address);
  }, [chainId, setAddress, sourceLanguage, targetLanguage]);

  const handleFinish = React.useCallback(
    async values => {
      const { originalTextFile, deadline, minPriceNumeric, maxPriceNumeric, ...rest } = values;
      send('SUBMIT');
      const formattedDeadline = new Date(deadline).toISOString();
      const metadata = {
        ...rest,
        account,
        minPrice: safeToWei(minPriceNumeric),
        maxPrice: safeToWei(maxPriceNumeric),
        deadline: moment(formattedDeadline).unix(),
        originalTextFile: extractOriginalTextFilePath(originalTextFile),
      };

      try {
        const metaEvidence = await publishMetaEvidence(chainId, metadata);
        await createTask(moment(formattedDeadline).unix(), metadata.minPrice, metaEvidence, metadata.maxPrice);
      } finally {
        send('RESET');
      }
    },
    [send, account, chainId, createTask]
  );

  const handleFinishFailed = React.useCallback(
    ({ errorFields }) => {
      form.scrollToField(errorFields[0].name);
    },
    [form]
  );

  const steps = React.useMemo(
    () => [
      {
        title: 'Choose Languages',
        fields: ['sourceLanguage', 'targetLanguage', 'expectedQuality'],
        content: [
          <Row key="languages" gutter={rowGutter}>
            <LanguagesSelectionFields setFieldsValue={form.setFieldsValue} />
          </Row>,
          <Spacer key="spacer" />,
          <Row key="expectedQuality" gutter={rowGutter}>
            <ExpectedQualityField initialValue={initialValues.expectedQuality} />
          </Row>,
        ],
      },
      {
        title: 'Translation Details',
        fields: [
          'title',
          'originalTextFile',
          'wordCount',
          'originalTextUrl',
          'deadline',
          'maxPriceNumeric',
          'minPriceNumeric',
        ],
        content: [
          <Row key="title" gutter={rowGutter}>
            <TitleField />
          </Row>,
          <Row key="originalSources" gutter={rowGutter}>
            <OriginalSourceFields setFieldsValue={form.setFieldsValue} />
          </Row>,
          <Row key="deadline+price" gutter={rowGutter}>
            <DeadlineField setFieldsValue={form.setFieldsValue} />
            <PriceDefinitionFields />
          </Row>,
        ],
      },
    ],
    [form]
  );

  const [currentStep, setCurrentStep] = React.useState(0);

  const handleGoToPreviousStep = React.useCallback(() => {
    setCurrentStep(current => Math.max(0, current - 1));
  }, []);

  const handleGoToNextStep = React.useCallback(async () => {
    const { fields } = steps[currentStep];

    try {
      await form.validateFields(fields);
      setCurrentStep(currentStep + 1);
      window.requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    } catch (err) {
      const firstErrorFieldName = err?.errorFields?.[0].name;
      if (firstErrorFieldName) {
        form.scrollToField(firstErrorFieldName);
      }
    }
  }, [steps, currentStep, form]);

  return (
    <StyledForm
      scrollToFirstError
      requiredMark="optional"
      layout="vertical"
      form={form}
      initialValues={initialValues}
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
      noValidate
    >
      <StyledSteps responsive size="small" current={currentStep}>
        {steps.map(({ title }, index) => (
          <Steps.Step key={index} title={title} />
        ))}
      </StyledSteps>
      {steps.map(({ content }, index) => (
        <StyledStepWrapper key={index} hidden={currentStep !== index}>
          {content}
        </StyledStepWrapper>
      ))}
      <AffixContainer>
        <StyledButtonBar>
          {currentStep !== 0 ? (
            <Button variant="outlined" htmlType="button" onClick={handleGoToPreviousStep}>
              Previous
            </Button>
          ) : null}

          {currentStep < steps.length - 1 ? (
            <Button htmlType="button" onClick={handleGoToNextStep}>
              Next
            </Button>
          ) : null}
          {currentStep === steps.length - 1 ? (
            <Button
              {...(state === 'submitting'
                ? {
                    icon: <LoadingOutlined />,
                    disabled: true,
                    children: 'Request the Translation',
                  }
                : {
                    children: 'Request the Translation',
                  })}
              htmlType="submit"
            />
          ) : null}
        </StyledButtonBar>
      </AffixContainer>
    </StyledForm>
  );
}

export default TranslationRequestForm;

const safeToWei = value => (Number.isNaN(Number.parseFloat(value)) ? '0' : normalizeBaseUnit(value));

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

const StyledSteps = styled(Steps)`
  && {
    margin-left: auto;
    margin-right: auto;
    max-width: 36rem;
  }
`;

const StyledStepWrapper = styled.div`
  padding: 1rem 0 3.5rem;

  @media (min-width: 576px) {
    padding-top: 2.5rem;
  }

  @media (min-width: 768px) {
    padding-top: 4rem;
  }
`;

const StyledButtonBar = styled.div`
  display: flex;
  gap: 1rem;

  .ant-btn {
    min-width: 10rem;

    :last-of-type {
      margin-left: auto;
    }
  }
`;
