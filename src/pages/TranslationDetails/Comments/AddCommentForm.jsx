import React from 'react';
import t from 'prop-types';
import { Form, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Button from '~/shared/Button';

export default function AddCommentForm({ onFinish, disabled }) {
  const [form] = Form.useForm();
  const [state, setState] = React.useState('idle');

  const handleFinish = React.useCallback(
    async values => {
      setState('loading');
      try {
        form.resetFields();
        await onFinish(values);
      } finally {
        setState('idle');
      }
    },
    [form, onFinish]
  );

  return (
    <Form
      hideRequiredMark
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      css={`
        opacity: ${disabled ? '0.5' : '1'};
      `}
    >
      <Form.Item
        label="Add a Comment"
        name="comment"
        rules={[
          {
            required: true,
            message: 'The comment cannot be empty.',
          },
          {
            whitespace: true,
            message: 'The comment cannot be empty.',
          },
        ]}
      >
        <Input.TextArea autoSize={{ minRows: 4 }} />
      </Form.Item>
      <div
        css={`
          text-align: right;
        `}
      >
        <Button
          htmlType="submit"
          disabled={disabled || state === 'loading'}
          icon={state === 'loading' ? <LoadingOutlined /> : null}
        >
          {state === 'loading' ? 'Submitting' : 'Submit Comment'}
        </Button>
      </div>
    </Form>
  );
}

AddCommentForm.propTypes = {
  onFinish: t.func.isRequired,
  disabled: t.bool,
};

AddCommentForm.defaultProps = {
  disabled: false,
};
