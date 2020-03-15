import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Form, Checkbox, Input, Row, notification } from 'antd';
import Button from '~/components/Button';
import { createCustomIcon } from '~/adapters/antd';
import _EmailIcon from '~/assets/images/icon-email.svg';
import { Popover, Button as TrayButton, Icon } from './adapters';

const EmailIcon = createCustomIcon(_EmailIcon, Icon);

const settings = {
  delivery: 'The translator delivers the translation (Review Time).',
  challenge: 'The translation is challenged and goes to arbitration.',
  ruling: 'The jurors rule about the translation.',
};

const StyledPopover = styled(Popover)`
  width: 24rem;
`;

const StyledForm = styled(Form)`
  padding-top: 1rem;
`;

const StyleFormButtonRow = styled(Row)`
  display: flex;
  justify-content: flex-end;
`;

function EmailNotificationsForm({ onSubmit }) {
  const [form] = Form.useForm();

  const initialValues = {
    delivery: false,
    challenge: false,
    ruling: false,
  };

  const onFinish = React.useCallback(
    values => {
      notification.success({
        message: "You've updated your e-mail subscription settings!",
        placement: 'bottomRight',
        duration: 10,
      });
      onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <StyledForm form={form} initialValues={initialValues} onFinish={onFinish} layout="vertical" scrollToFirstError>
      {Object.entries(settings).map(([key, label]) => (
        <Form.Item key={key} name={key} valuePropName="checked">
          <Checkbox>{label}</Checkbox>
        </Form.Item>
      ))}
      <Form.Item
        name={'email'}
        rules={[
          {
            message: 'Please enter your email.',
            required: true,
          },
          {
            message: 'Please enter a valid email.',
            type: 'email',
          },
        ]}
      >
        <Input placeholder="E-mail" />
      </Form.Item>
      <StyleFormButtonRow>
        <Button htmlType="submit">Subscribe</Button>
      </StyleFormButtonRow>
    </StyledForm>
  );
}

EmailNotificationsForm.propTypes = {
  onSubmit: t.func,
};

EmailNotificationsForm.defaultProps = {
  onSubmit: () => {},
};

function EmailNotifications() {
  const [visible, setVisible] = React.useState(false);

  const handleTrayButtonClick = React.useCallback(() => {
    setVisible(visible => !visible);
  }, []);

  const handleVisibilityChange = React.useCallback(visible => {
    setVisible(visible);
  }, []);

  const handleFormSubmit = React.useCallback(visible => {
    setVisible(false);
  }, []);

  return (
    <StyledPopover
      arrowPointAtCenter
      content={<EmailNotificationsForm onSubmit={handleFormSubmit} />}
      placement="bottomRight"
      title="Notify me by e-mail when:"
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibilityChange}
    >
      <TrayButton shape="round" onClick={handleTrayButtonClick}>
        <EmailIcon />
      </TrayButton>
    </StyledPopover>
  );
}

export default EmailNotifications;
