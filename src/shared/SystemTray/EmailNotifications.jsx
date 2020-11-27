import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Checkbox, Input, Row } from 'antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { Spin } from '~/adapters/antd';
import Button from '~/shared/Button';
import { EmailIcon } from '~/shared/icons';
import { selectAccount } from '~/features/web3/web3Slice';
import {
  selectPreferences,
  selectIsLoadingPreferences,
  update,
  fetchByAccount,
} from '~/features/emailPreferences/emailPreferencesSlice';
import { notify } from '~/features/ui/uiSlice';
import { Popover, Button as TrayButton, withToolbarStylesIcon } from './adapters';
import { PopupNotificationLevel } from '~/features/ui/popupNotificationsSlice';

export default function EmailNotifications() {
  const [visible, setVisible] = React.useState(false);

  const handleVisibilityChange = React.useCallback(visible => {
    setVisible(visible);
  }, []);

  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const preferences = useShallowEqualSelector(state => selectPreferences(state, { account }));
  const isLoadingPreferences = useSelector(state => selectIsLoadingPreferences(state, { account }));

  React.useEffect(() => {
    dispatch(fetchByAccount({ account }));
  }, [dispatch, account]);

  const handleFormSubmit = React.useCallback(
    async values => {
      try {
        await dispatch(update({ account, ...values }, { meta: { thunk: { id: account } } }));

        dispatch(
          notify({
            message: "You've updated your e-mail subscription settings!",
            level: PopupNotificationLevel.success,
            key: 'update-email-preferences',
          })
        );
      } catch (err) {
        console.warn('Error:', err.error);
        dispatch(
          notify({
            message: 'Failed to update your e-mail subscription settings!',
            description: 'Please try again.',
            level: PopupNotificationLevel.error,
            key: 'update-email-preferences',
          })
        );
      } finally {
        setVisible(false);
      }
    },
    [dispatch, account]
  );

  return (
    <StyledPopover
      arrowPointAtCenter
      content={
        <Spin spinning={isLoadingPreferences}>
          <EmailNotificationsForm initialValues={preferences} onSubmit={handleFormSubmit} />
        </Spin>
      }
      placement="bottomRight"
      title="Notify me by e-mail when:"
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibilityChange}
    >
      <TrayButton shape="round">
        <StyledEmailIcon />
      </TrayButton>
    </StyledPopover>
  );
}

function EmailNotificationsForm({ onSubmit, initialValues }) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue({ ...DEFAULT_INITIAL_VALUES, ...initialValues });
  }, [form, initialValues]);

  return (
    <StyledForm
      hideRequiredMark
      form={form}
      initialValues={initialValues}
      onFinish={onSubmit}
      layout="vertical"
      scrollToFirstError
    >
      {Object.entries(settings).map(([role, { label, items }]) => (
        <StyledGroupItem key={role} label={label}>
          {Object.entries(items).map(([key, description]) => (
            <StyledCheckboxItem key={`${role}-${key}`} name={['preferences', role, key]} valuePropName="checked">
              <Checkbox>{description}</Checkbox>
            </StyledCheckboxItem>
          ))}
        </StyledGroupItem>
      ))}
      <Form.Item
        name="email"
        label="E-mail"
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
        <Input placeholder="Your e-mail address" />
      </Form.Item>
      <Form.Item
        name="fullName"
        label="Full Name (optional)"
        rules={[
          {
            message: 'Please enter you name or leave it empty.',
            whitespace: true,
          },
        ]}
      >
        <Input placeholder="Your full name" />
      </Form.Item>
      <StyleFormButtonRow>
        <Button htmlType="submit">Subscribe</Button>
      </StyleFormButtonRow>
    </StyledForm>
  );
}

EmailNotificationsForm.propTypes = {
  onSubmit: t.func,
  initialValues: t.shape({
    requester: t.shape({
      delivery: t.bool,
      challenge: t.bool,
      ruling: t.bool,
    }),
    translator: t.shape({
      challenge: t.bool,
      appealFunded: t.bool,
      ruling: t.bool,
    }),
    challenger: t.shape({
      appealFunded: t.bool,
      ruling: t.bool,
    }),
  }),
};

const DEFAULT_INITIAL_VALUES = {
  email: '',
  fullName: '',
  preferences: {
    requester: {
      delivery: false,
      challenge: false,
      ruling: false,
    },
    translator: {
      challenge: false,
      appealFunded: false,
      ruling: false,
    },
    challenger: {
      appealFunded: false,
      ruling: false,
    },
  },
};

EmailNotificationsForm.defaultProps = {
  onSubmit: () => {},
  initialValues: DEFAULT_INITIAL_VALUES,
};

const settings = {
  requester: {
    label: 'Requester',
    items: {
      delivery: 'The translator delivers the translation.',
      challenge: 'The translation is challenged and goes to arbitration.',
      ruling: 'The jurors rule about the translation.',
    },
  },
  translator: {
    label: 'Translator',
    items: {
      challenge: 'The translation is challenged and goes to arbitration.',
      appealFunded: 'The challenger pays for the full appeal cost.',
      ruling: 'The jurors rule about the translation.',
    },
  },
  challenger: {
    label: 'Challenger',
    items: {
      appealFunded: 'The translator pays for the full appeal cost.',
      ruling: 'The jurors rule about the translation.',
    },
  },
};

const StyledPopover = styled(Popover)`
  width: 28rem;
`;

const StyledEmailIcon = withToolbarStylesIcon(EmailIcon);

const StyledForm = styled(Form)`
  padding-top: 1rem;
`;

const StyledGroupItem = styled(Form.Item)`
  .ant-form-item-label {
    font-weight: ${p => p.theme.fontWeight.semibold};
  }
`;

const StyledCheckboxItem = styled(Form.Item)`
  && {
    margin-bottom: 0;
  }
`;

const StyleFormButtonRow = styled(Row)`
  display: flex;
  justify-content: flex-end;
`;
