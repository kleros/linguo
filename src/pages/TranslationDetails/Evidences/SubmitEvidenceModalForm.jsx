import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { message, Form, Radio, Input, Divider } from 'antd';

import Modal from '~/shared/Modal';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import SingleFileUpload, { validator as singleFileUploadValidator } from '~/shared/SingleFileUpload';
import { InfoIcon } from '~/shared/icons';
import { TaskParty } from '~/features/tasks';
import { LoadingOutlined } from '@ant-design/icons';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useLinguoApi } from '~/hooks/useLinguo';
import { useTask } from '~/hooks/useTask';

import publishEvidence, { TEMPLATE_TYPE } from '~/utils/dispute/submitEvidence';

export default function SubmitEvidenceModalForm({ trigger, forceClose }) {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);
  const { submitEvidence } = useLinguoApi();

  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (forceClose) {
      setVisible(false);
    }
  }, [forceClose]);

  const handleTriggerClick = React.useCallback(evt => {
    evt.preventDefault();
    setVisible(true);
  }, []);

  const modalTrigger = React.cloneElement(trigger, { onClick: handleTriggerClick });

  const [form] = Form.useForm();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleReset = React.useCallback(() => {
    form.resetFields();
    setVisible(false);
  }, [form]);

  const handleFinish = React.useCallback(
    async values => {
      console.log({ values });
      const overrides = {
        ...values,
        uploadedFile: extractUploadedFileResult(values.uploadedFile),
      };

      setIsSubmitting(true);
      try {
        const evidence = await publishEvidence(TEMPLATE_TYPE.evidence, task.taskID, overrides);
        await submitEvidence(task.taskID, evidence);
        handleReset();
      } finally {
        setIsSubmitting(false);
      }
    },
    [task.taskID, submitEvidence, handleReset]
  );

  const { currentParty } = task;

  const initialValues = {
    supportingSide: [TaskParty.Translator, TaskParty.Challenger].includes(currentParty) ? currentParty : undefined,
  };

  const submitButtonProps = isSubmitting
    ? {
        icon: <LoadingOutlined />,
        children: 'Submitting...',
        disabled: true,
      }
    : {
        children: 'Submit',
      };

  return (
    <div>
      {modalTrigger}
      <EvidenceModal visible={visible} setVisible={setVisible} onCancel={handleReset}>
        <StyledForm
          requiredMark={false}
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          onReset={handleReset}
          initialValues={initialValues}
        >
          <StyledFormItem
            name="supportingSide"
            label="Which side does the evidence support?"
            rules={[
              {
                required: true,
                message: 'Please pick a side.',
              },
            ]}
          >
            <StyledRadioGroup size="large">
              <StyledRadioWrapper>
                <Radio value={TaskParty.Translator}>
                  <StyledOption>Translator</StyledOption>
                  <StyledOptionDescription>
                    The translation should be <strong>accepted</strong>.
                  </StyledOptionDescription>
                </Radio>
              </StyledRadioWrapper>
              <StyledRadioWrapper>
                <Radio value={TaskParty.Challenger}>
                  <StyledOption>Challenger</StyledOption>
                  <StyledOptionDescription>
                    The translation should be <strong>rejected</strong>.
                  </StyledOptionDescription>
                </Radio>
              </StyledRadioWrapper>
            </StyledRadioGroup>
          </StyledFormItem>
          <StyledDivider
            css={`
              margin: 1rem 0 2rem;
            `}
          />
          <Form.Item noStyle shouldUpdate={(prev, current) => prev.supportingSide !== current.supportingSide}>
            {({ getFieldValue }) => (
              <StyledFormItem
                name="title"
                label="Evidence Title"
                rules={[
                  {
                    required: true,
                    message: 'Please provide a title.',
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder={
                    getFieldValue('supportingSide') === TaskParty.Translator
                      ? 'e.g.: The translation is correct'
                      : 'e.g.: The translation is not 100% correct'
                  }
                />
              </StyledFormItem>
            )}
          </Form.Item>
          <Spacer />
          <StyledFormItem
            name="description"
            label="Evidence Description"
            rules={[
              {
                required: true,
                message: 'Please provide a description.',
              },
            ]}
          >
            <Input.TextArea
              placeholder="Your arguments"
              allowClear
              size="large"
              autoSize={{ minRows: 5, maxRows: 50 }}
            />
          </StyledFormItem>
          <Spacer />
          <Form.Item
            name="uploadedFile"
            valuePropName="fileList"
            getValueFromEvent={normalizeFile}
            rules={[{ validator: uploadValidator }]}
            extra={
              <StyledInfo>
                <InfoIcon /> Optionally you can add a single file (plain text, PDF or image) or add multiple files in a
                single .zip file
              </StyledInfo>
            }
          >
            <SingleFileUpload
              fullWidth
              beforeUpload={beforeUpload}
              accept={ACCEPTED_FILE_TYPES}
              buttonProps={{
                variant: 'outlined',
              }}
            />
          </Form.Item>
          <Spacer />
          <StyledButtonBar>
            <StyledButton variant="outlined" htmlType="reset">
              Return
            </StyledButton>
            <StyledButton variant="filled" htmlType="submit" {...submitButtonProps} />
          </StyledButtonBar>
        </StyledForm>
      </EvidenceModal>
    </div>
  );
}

SubmitEvidenceModalForm.propTypes = {
  trigger: t.node.isRequired,
  forceClose: t.bool,
};

SubmitEvidenceModalForm.defaultProps = {
  forceClose: false,
};

const normalizeFile = e => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const ACCEPTED_FILE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
  'multipart/x-zip',
  'application/pdf',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const _1_MB = 2e10 * 2e10;
const _100_MB = 100 * _1_MB;

const beforeUpload = file => {
  // do something...
  const isLte100M = file.size <= _100_MB;

  if (!isLte100M) {
    message.error('File must smaller than 100 MB!');
  }

  const hasAllowedExtension = ACCEPTED_FILE_TYPES.includes(file.type);

  if (!hasAllowedExtension) {
    message.error('File must be either PDF or ZIP.');
  }

  return isLte100M && hasAllowedExtension;
};

async function uploadValidator(rule, value) {
  if (!value || value.length === 0) {
    return '';
  }

  return singleFileUploadValidator(value, {
    allowedTypes: ACCEPTED_FILE_TYPES,
    maxSize: _100_MB,
  });
}

const extractUploadedFileResult = attachedFile => {
  if (attachedFile?.length > 0) {
    const { status, path, hash } = attachedFile[0].response || {};

    if (status === 'done' && !!path) {
      return { path, hash };
    }
  }

  return undefined;
};

function EvidenceModal({ children, visible, setVisible, onCancel }) {
  const handleCancel = () => {
    setVisible(false);
    onCancel();
  };

  return (
    <Modal centered title="Submit New Evidence" footer={null} visible={visible} onCancel={handleCancel}>
      {children}
    </Modal>
  );
}

EvidenceModal.propTypes = {
  children: t.node.isRequired,
  visible: t.bool.isRequired,
  setVisible: t.func.isRequired,
  onCancel: t.func,
};

EvidenceModal.defaultProps = {
  onCancel: () => {},
};

const StyledForm = styled(Form)`
  color: ${p => p.theme.color.text.default};

  .ant-form-item {
    color: ${p => p.theme.color.text.default};
  }
`;

const StyledFormItem = styled(Form.Item)`
  ${p => p.disabled && 'opacity: 0.25'};

  .ant-form-item-label {
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: ${p => p.theme.fontWeight.semibold};
    text-align: center;
  }
`;

const StyledRadioGroup = styled(Radio.Group)`
  width: 100%;
  color: inherit;
`;

const StyledRadioWrapper = styled.div`
  :first-of-type:not(:only-of-type) {
    border-bottom: 1px solid ${p => p.theme.color.secondary.default};
  }

  :not(.disabled):hover {
    background: ${p => p.theme.color.background.default};

    .ant-radio-inner,
    .ant-radio-inner:focus,
    .ant-radio-inner:hover {
      border-color: ${p => p.theme.color.secondary.default};

      ::after {
        background-color: ${p => p.theme.color.secondary.default};
      }
    }
  }

  .ant-radio-wrapper {
    display: flex;
    align-items: center;
    padding: 1rem 0;
    margin: 0;
    color: inherit;

    .ant-radio {
      order: 1;

      & + span {
        padding-left: 0;
      }
    }

    .ant-radio-inner {
      width: 1.5rem;
      height: 1.5rem;

      ::after {
        width: 0.75rem;
        height: 0.75rem;
        top: 5px;
        left: 5px;
      }
    }

    > span:last-of-type {
      flex: 1;
    }
  }
`;

const StyledOption = styled.p``;

const StyledOptionDescription = styled.sub`
  font-size: ${p => p.theme.fontSize.sm};
  font-weight: ${p => p.theme.fontWeight.regular};
  color: ${p => p.theme.color.text.light};
`;

const StyledDivider = styled(Divider)``;

const StyledInfo = styled.div`
  margin-top: 1rem;
  color: ${p => p.theme.color.text.light};
  font-size: ${p => p.theme.fontSize.sm};
  font-weight: ${p => p.theme.fontWeight.regular};
`;

const StyledButton = styled(Button)``;

const StyledButtonBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  ${StyledButton} {
    flex: 10rem 0 1;
  }
`;
