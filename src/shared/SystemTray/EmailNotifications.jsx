import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox, Form, Input, Row } from 'antd';
import { Spin } from '~/adapters/antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { PopupNotificationLevel } from '~/features/ui/popupNotificationsSlice';
import { notify } from '~/features/ui/uiSlice';
import {
  DEFAULT_INITIAL_VALUES,
  fetchByAccount,
  selectIsLoadingSettings,
  selectSettings,
  update,
} from '~/features/users/userSettingsSlice';
import { selectAccount } from '~/features/web3/web3Slice';
import Button from '~/shared/Button';
import { compose, flatten, mapValues } from '~/shared/fp';

export default function EmailNotifications() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const settings = useShallowEqualSelector(state => selectSettings(state, { account }));
  const isLoadingPreferences = useSelector(state => selectIsLoadingSettings(state, { account }));

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
      }
    },
    [dispatch, account]
  );

  return (
    <Spin $centered spinning={isLoadingPreferences}>
      <EmailNotificationsForm initialValues={settings} onSubmit={handleFormSubmit} />
    </Spin>
  );
}

function EmailNotificationsForm({ onSubmit, initialValues }) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const initialEmailPreferences = React.useMemo(
    () => compose(flatten, Object.values, mapValues(Object.values))(initialValues?.emailPreferences ?? {}),
    [initialValues.emailPreferences]
  );

  const checkAll = useCheckAll({
    initialValues: initialEmailPreferences,
    getValues: React.useCallback(
      () => compose(flatten, Object.values, mapValues(Object.values))(form.getFieldValue('emailPreferences')),
      [form]
    ),
    setValues: React.useCallback(
      checked => {
        form.setFieldsValue({
          emailPreferences: mapValues(
            mapValues(() => checked),
            DEFAULT_INITIAL_VALUES.emailPreferences
          ),
        });
      },
      [form]
    ),
  });

  return (
    <StyledForm
      hideRequiredMark
      form={form}
      initialValues={initialValues}
      onFinish={onSubmit}
      layout="vertical"
      scrollToFirstError
    >
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
      <Form.Item>
        <Checkbox
          checked={checkAll.checked}
          onChange={checkAll.handleAllCheckedChange}
          indeterminate={checkAll.indeterminate}
        >
          Notify me of everything.
        </Checkbox>
      </Form.Item>
      {Object.entries(settings).map(([role, { label, items }]) => (
        <StyledGroupItem key={role} label={label}>
          {Object.entries(items).map(([key, description]) => (
            <StyledCheckboxItem key={`${role}-${key}`} name={['emailPreferences', role, key]} valuePropName="checked">
              <Checkbox onChange={checkAll.handleItemCheckedChange}>{description}</Checkbox>
            </StyledCheckboxItem>
          ))}
        </StyledGroupItem>
      ))}
      <StyleFormButtonRow>
        <Button
          htmlType="submit"
          css={`
            flex: 8rem 0 1;
          `}
        >
          Save
        </Button>
      </StyleFormButtonRow>
    </StyledForm>
  );
}

EmailNotificationsForm.propTypes = {
  onSubmit: t.func,
  initialValues: t.shape({
    email: '',
    fullName: '',
    emailPreferences: t.shape({
      requester: t.shape({
        delivery: t.bool,
        challenge: t.bool,
        ruling: t.bool,
      }),
      translator: t.shape({
        challenge: t.bool,
        appealFunding: t.bool,
        ruling: t.bool,
      }),
      challenger: t.shape({
        appealFunding: t.bool,
        ruling: t.bool,
      }),
    }),
  }).isRequired,
};

EmailNotificationsForm.defaultProps = {
  onSubmit: () => {},
};

function useCheckAll({ initialValues, getValues, setValues }) {
  const [checked, setChecked] = React.useState(() => {
    const checked = initialValues.every(value => !!value);

    return checked;
  });

  const [indeterminate, setIndeterminate] = React.useState(() => {
    const allChecked = initialValues.every(value => !!value);
    const noneChecked = initialValues.every(value => !value);

    return !allChecked && !noneChecked;
  });

  React.useEffect(() => {
    const allChecked = initialValues.every(value => !!value);
    const noneChecked = initialValues.every(value => !value);

    setIndeterminate(!allChecked && !noneChecked);
    setChecked(allChecked);
  }, [initialValues]);

  const handleAllCheckedChange = React.useCallback(
    e => {
      setValues(e.target.checked);
      setIndeterminate(false);
      setChecked(e.target.checked);
    },
    [setValues]
  );

  const handleItemCheckedChange = React.useCallback(() => {
    const values = getValues();

    const allChecked = values.every(value => !!value);
    const noneChecked = values.every(value => !value);

    setIndeterminate(!allChecked && !noneChecked);
    setChecked(allChecked);
  }, [getValues]);

  return {
    checked,
    indeterminate,
    handleAllCheckedChange,
    handleItemCheckedChange,
  };
}

const settings = {
  requester: {
    label: 'Requester',
    items: {
      assignment: 'A translation is assigned to a translator.',
      delivery: 'A translator delivers the translation.',
      resolution: 'A translation task is resolved.',
      challenge: 'A translation is challenged and goes to arbitration.',
      ruling: 'The jurors rule about a challenged translation.',
    },
  },
  translator: {
    label: 'Translator',
    items: {
      resolution: 'A translation task is resolved.',
      challenge: 'A translation is challenged and goes to arbitration.',
      appealFunding: 'The challenger pays the appeal cost of a dispute.',
      ruling: 'The jurors rule about a challenged translation.',
    },
  },
  challenger: {
    label: 'Challenger',
    items: {
      appealFunding: 'The translator pays the appeal cost of a dispute.',
      ruling: 'The jurors rule about the translation.',
    },
  },
};

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
