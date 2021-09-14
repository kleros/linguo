import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { MinusOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Checkbox, Col, Form, Input, Popconfirm, Row, Switch } from 'antd';
import { Spin } from '~/adapters/antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { PopupNotificationLevel } from '~/features/ui/popupNotificationsSlice';
import { notify } from '~/features/ui/uiSlice';
import { isUserSettingsSupported } from '~/features/users';
import { fetchByAccount, selectIsLoadingSettings, selectSettings, update } from '~/features/users/userSettingsSlice';
import { getNetworkName } from '~/features/web3';
import { selectAccount, selectChainId } from '~/features/web3/web3Slice';
import Button from '~/shared/Button';
import ContentBlocker from '~/shared/ContentBlocker';
import { mapValues } from '~/shared/fp';
import Spacer from '~/shared/Spacer';

const CheckAllState = {
  Unchecked: 0,
  Checked: 1,
  Indeterminate: 2,
};

export default function EmailNotificationsWrapper() {
  const chainId = useSelector(selectChainId);

  return (
    <ContentBlocker
      blocked={!isUserSettingsSupported({ chainId })}
      overlayText={
        <span
          css={`
            color: ${p => p.theme.color.danger.default};
            background-color: ${p => p.theme.color.background.light};
            font-size: ${p => p.theme.fontSize.xxl};
            font-weight: ${p => p.theme.fontWeight.bold};
            padding: 0.25rem 1rem;
            border-radius: 3px;
            white-space: nowrap;
            display: inline-block;
            transform: rotateZ(-15deg);
          `}
        >
          Unavailable on {getNetworkName(chainId)}
        </span>
      }
    >
      <EmailNotifications />
    </ContentBlocker>
  );
}

function EmailNotifications() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const settings = useShallowEqualSelector(state => selectSettings(state, { account }));
  const isLoadingSettings = useSelector(state => selectIsLoadingSettings(state, { account }));

  React.useEffect(() => {
    dispatch(fetchByAccount({ account }));
  }, [dispatch, account]);

  const handleFormSubmit = React.useCallback(
    async values => {
      try {
        await dispatch(update({ account, ...formValuesToSettings(values) }, { meta: { thunk: { id: account } } }));

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

  const handleFormReset = React.useCallback(async () => {
    try {
      await dispatch(update({ account }, { meta: { thunk: { id: account } } }));

      dispatch(
        notify({
          message: "You've removed all your e-mail subscription data!",
          level: PopupNotificationLevel.success,
          key: 'remove-email-subscription-data',
        })
      );
    } catch (err) {
      console.warn('Error:', err.error);

      dispatch(
        notify({
          message: 'Failed to remove your e-mail subscription data!',
          description: 'Please try again.',
          level: PopupNotificationLevel.error,
          key: 'remove-email-subscription-data',
        })
      );
    }
  }, [dispatch, account]);

  return (
    <Spin $centered spinning={isLoadingSettings}>
      <EmailNotificationsForm settings={settings} onSubmit={handleFormSubmit} onReset={handleFormReset} />
    </Spin>
  );
}

const formValuesToSettings = values => {
  const { email, fullName, emailPreferences } = values;

  return {
    email,
    fullName,
    emailPreferences: mapValues(
      selected => selected.reduce((acc, item) => Object.assign(acc, { [item]: true }), {}),
      emailPreferences
    ),
  };
};

const settingsToFormValues = settings => {
  const { email, fullName, emailPreferences } = settings;
  const transformedValues = {
    email,
    fullName,
    emailPreferences: mapValues(
      settings => Object.entries(settings).reduce((acc, [key, value]) => (value ? [...acc, key] : acc), []),
      emailPreferences
    ),
  };

  return transformedValues;
};

function EmailNotificationsForm({ onSubmit, onReset, settings }) {
  const [form] = Form.useForm();

  const initialValues = React.useMemo(() => settingsToFormValues(settings), [settings]);

  const groupCheckboxes = useCheckboxNestedGroups({
    allOptions: allEmailPreferencesOptions,
    initialValues: initialValues?.emailPreferences ?? {},
    getFormValues: React.useCallback(() => form.getFieldValue(['emailPreferences']), [form]),
    setFormValues: React.useCallback(values => form.setFieldsValue({ emailPreferences: values }), [form]),
  });

  React.useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const handleValuesChange = React.useCallback(
    (changedValues, allValues) => {
      groupCheckboxes.all.setValues(allValues?.emailPreferences ?? {});
    },
    [groupCheckboxes.all]
  );

  return (
    <StyledForm
      requiredMark={false}
      form={form}
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
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
      <StyledSelectAllItem>
        <Checkbox
          {...checkAllStateToCheckboxProps(groupCheckboxes.all.state)}
          onChange={groupCheckboxes.all.handleChange}
        >
          Notify me of everything
        </Checkbox>
      </StyledSelectAllItem>
      {Object.entries(settingsDisplayData).map(([role, { label, items }]) => (
        <EmailPreferencesGroup
          key={role}
          role={role}
          label={label}
          items={items}
          state={groupCheckboxes[role].state}
          onChange={groupCheckboxes[role].handleChange}
        />
      ))}
      <Spacer />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Popconfirm
            placement="top"
            title="Are you sure?"
            onConfirm={onReset}
            cancelText="No"
            okText="Yes"
            okButtonProps={{ danger: true }}
            icon={
              <QuestionCircleOutlined
                css={`
                  color: ${p => p.theme.color.danger.default} !important;
                `}
              />
            }
          >
            <Button fullWidth htmlType="reset" variant="outlined">
              Clear my Data
            </Button>
          </Popconfirm>
        </Col>
        <Col xs={24} md={12}>
          <Button fullWidth htmlType="submit">
            Save
          </Button>
        </Col>
      </Row>
    </StyledForm>
  );
}

EmailNotificationsForm.propTypes = {
  onSubmit: t.func,
  onReset: t.func,
  settings: t.shape({
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
  onReset: () => {},
};

function EmailPreferencesGroup({ role, label, items, state, onChange }) {
  const [showDetails, setShowDetails] = React.useState(state === CheckAllState.Indeterminate);

  React.useEffect(() => {
    setShowDetails(current => current || state === CheckAllState.Indeterminate);
  }, [state]);

  const disablePropagation = React.useCallback((_, evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    evt.persist();
    evt.nativeEvent.stopImmediatePropagation();
  }, []);

  return (
    <StyledGroupItem
      className={clsx({ 'no-details': !showDetails })}
      key={role}
      name={['emailPreferences', role]}
      label={
        <Checkbox name={role} {...checkAllStateToCheckboxProps(state)} onChange={onChange}>
          <span
            css={`
              display: inline-flex;
              align-items: center;
              gap: 8px;
            `}
          >
            {label}
            <Switch
              size="small"
              checked={showDetails}
              onChange={setShowDetails}
              onClick={disablePropagation}
              checkedChildren={<MinusOutlined />}
              unCheckedChildren={<PlusOutlined />}
            />
          </span>
        </Checkbox>
      }
    >
      <StyledCheckboxGroup
        className={clsx({ hidden: !showDetails })}
        options={Object.entries(items).map(([key, description]) => ({ label: description, value: key }))}
      />
    </StyledGroupItem>
  );
}

EmailPreferencesGroup.propTypes = {
  role: t.string.isRequired,
  label: t.node.isRequired,
  items: t.object.isRequired,
  state: t.oneOf(Object.values(CheckAllState)).isRequired,
  onChange: t.func.isRequired,
};

function useCheckboxNestedGroups({ initialValues, allOptions, getFormValues, setFormValues }) {
  const [checkboxGroupsState, setCheckboxGroupsState] = React.useState(() => deriveCheckboxGroupsState(initialValues));

  const setCheckboxGroupsStateFromValues = React.useCallback(values => {
    setCheckboxGroupsState(deriveCheckboxGroupsState(values));
  }, []);

  React.useEffect(() => {
    setCheckboxGroupsStateFromValues(initialValues);
    setFormValues(initialValues);
  }, [setCheckboxGroupsStateFromValues, setFormValues, initialValues]);

  const handleCheckAllChange = React.useCallback(
    evt => {
      const { checked } = evt.target;
      const newValue = checked ? allOptions : mapValues(() => [], allOptions);

      setCheckboxGroupsStateFromValues(newValue);
      setFormValues(newValue);
    },
    [allOptions, setCheckboxGroupsStateFromValues, setFormValues]
  );

  const handleCheckGroupChange = React.useCallback(
    evt => {
      const { checked, name } = evt.target;
      const currentValues = getFormValues();
      const valuePatch = checked ? allOptions[name] : [];
      const newValue = { ...currentValues, [name]: valuePatch };

      setCheckboxGroupsStateFromValues(newValue);
      setFormValues(newValue);
    },
    [allOptions, getFormValues, setCheckboxGroupsStateFromValues, setFormValues]
  );

  return React.useMemo(
    () => ({
      ...mapValues(
        state => ({
          state,
          handleChange: handleCheckGroupChange,
        }),
        checkboxGroupsState
      ),
      all: {
        state: checkboxGroupsState.all,
        handleChange: handleCheckAllChange,
        setValues: setCheckboxGroupsStateFromValues,
      },
    }),
    [checkboxGroupsState, setCheckboxGroupsStateFromValues, handleCheckAllChange, handleCheckGroupChange]
  );
}

const deriveCheckboxGroupsState = values => {
  const statesByKey = mapValues((options, key) => {
    const length = values?.[key]?.length ?? 0;
    return length === 0
      ? CheckAllState.Unchecked
      : length === options.length
      ? CheckAllState.Checked
      : CheckAllState.Indeterminate;
  }, allEmailPreferencesOptions);

  const states = Object.values(statesByKey);
  const allChecked = states.every(state => state === CheckAllState.Checked);
  const allUnchecked = states.every(state => state === CheckAllState.Unchecked);
  const all = allChecked ? CheckAllState.Checked : allUnchecked ? CheckAllState.Unchecked : CheckAllState.Indeterminate;

  return { ...statesByKey, all };
};

const settingsDisplayData = {
  requester: {
    label: 'Requester Notifications',
    items: {
      assignment: 'A translation is assigned to a translator.',
      delivery: 'A translator delivers the translation.',
      resolution: 'A translation task is resolved.',
      challenge: 'A translation is challenged and goes to arbitration.',
      ruling: 'The jurors rule about a challenged translation.',
    },
  },
  translator: {
    label: 'Translator Notifications',
    items: {
      resolution: 'A translation task is resolved.',
      challenge: 'A translation is challenged and goes to arbitration.',
      appealFunding: 'The challenger pays the appeal cost of a dispute.',
      ruling: 'The jurors rule about a challenged translation.',
    },
  },
  challenger: {
    label: 'Challenger Notifications',
    items: {
      appealFunding: 'The translator pays the appeal cost of a dispute.',
      ruling: 'The jurors rule about the translation.',
    },
  },
};

const allEmailPreferencesOptions = mapValues(({ items }) => Object.keys(items), settingsDisplayData);

const checkAllStateToCheckboxProps = state => ({
  checked: state === CheckAllState.Checked,
  indeterminate: state === CheckAllState.Indeterminate,
});

const StyledForm = styled(Form)`
  padding-top: 1rem;
`;

const StyledSelectAllItem = styled(Form.Item)`
  && {
    margin-bottom: 12px;
  }
`;

const StyledGroupItem = styled(Form.Item)`
  margin-left: 24px;

  &.no-details {
    margin-bottom: 12px;

    > .ant-form-item-control {
      display: none;
    }
  }
`;

const StyledCheckboxGroup = styled(Checkbox.Group)`
  &.hidden {
    display: none;
  }

  && {
    .ant-checkbox-wrapper {
      margin-left: 24px;
    }
  }
`;
