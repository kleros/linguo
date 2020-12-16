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
        await onFinish(values);
        form.resetFields();
      } finally {
        setState('idle');
      }
    },
    [form, onFinish]
  );

  return (
    <Form hideRequiredMark layout="vertical" form={form} onFinish={handleFinish}>
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
          {state === 'loading' ? 'Submitting' : 'Submit'}
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
