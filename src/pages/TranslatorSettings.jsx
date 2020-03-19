import React from 'react';
import t from 'prop-types';
import produce from 'immer';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import useTranslatorSettings from '~/hooks/useTranslatorSettings';
import { Row, Col, Form, Select, Typography, Alert, notification } from 'antd';
import SingleCardLayout from '~/pages/layouts/SingleCardLayout';
import Button from '~/components/Button';
import languages from '~/assets/fixtures/languages';
import getLanguageFlag from '~/components/helpers/getLanguageFlag';
import { createCustomIcon } from '~/adapters/antd';
import _RemoveIcon from '~/assets/images/icon-remove.svg';
import _AddIcon from '~/assets/images/icon-add.svg';
import _InfoIcon from '~/assets/images/icon-info.svg';

const StyledBaseSelect = styled(Select)`
  &&& {
    height: 5.75rem;
    color: ${props => props.theme.text.inverted};

    &.ant-select-single.ant-select-open .ant-select-selection-item {
      opacity: 0.75;
    }

    .ant-select-arrow {
      color: ${props => props.theme.text.inverted};
      right: 2rem;
      margin-top: -0.825rem;
      width: 1.5rem;
      height: 1.5rem;

      .anticon,
      .anticon svg {
        width: 100%;
        height: 100%;
      }
    }

    .ant-select-selector {
      height: 100%;
      padding: 0 2rem;
      border-radius: 0.75rem;
      border-width: 0.3125rem !important;
      border-color: ${props => props.theme.border.default};

      .ant-select-selection-search-input {
        height: 100%;
        padding: 0 1rem 0 1rem;
        font-size: ${props => props.theme.fontSize.xl};
        font-weight: 400;
      }

      .ant-select-selection-placeholder,
      .ant-select-selection-item {
        display: flex;
        align-items: center;
        font-size: ${props => props.theme.fontSize.xl};
        font-weight: 400;
        color: ${props => props.theme.text.inverted};
      }

      .ant-select-selection-placeholder {
        opacity: 0.75;
      }
    }
  }
`;

const StyledLanguageSelect = styled(StyledBaseSelect)`
  &&& {
    .ant-select-selector {
      background: linear-gradient(
        118.61deg,
        ${props => props.theme.primary.default} 42.83%,
        ${props => props.theme.primary.dark} 89.23%
      );

      .ant-select-selection-item {
        .flag {
          flex: 1.5rem 0 0;
        }

        .text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .ant-select-item-option-content {
      display: flex;
      align-items: center;
    }
  }
`;

const StyledLevelSelect = styled(StyledBaseSelect)`
  &&& {
    .ant-select-selector {
      background: linear-gradient(
        118.61deg,
        ${props => props.theme.secondary.default} 42.83%,
        ${props => props.theme.secondary.light} 89.23%
      );
    }
  }
`;

const StyledLanguageDropdown = styled.div`
  .ant-select-item-option-content {
    display: flex;
    align-items: center;
  }
`;

const StyledFlagContainer = styled.span`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 1rem;

  svg {
    display: block;
    width: 100%;
  }
`;

const StyledIconButton = styled(Button)`
  && {
    width: 100%;
    max-width: 2.5rem;
    min-width: 1rem;
    color: #ccc;
    transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

    :not([disabled]):hover,
    :not([disabled]):focus,
    :not([disabled]):active {
      color: #999;
    }

    .anticon,
    .anticon svg {
      width: 100%;
      height: 100%;
    }
  }
`;

const StyledFormItem = styled(Form.Item)`
  && {
    &.ant-form-item-has-error .ant-form-item-explain {
      margin-bottom: 1rem;
    }
  }
`;

const RemoveIcon = createCustomIcon(_RemoveIcon);

const emptyLevels = [];

const levelsByLanguage = languages.reduce(
  (acc, { code, levels }) =>
    Object.assign(acc, {
      [code]: levels,
    }),
  {}
);

function LanguageSelectionCombobox({ value, selectedValues, onChange, name, remove }) {
  const handleRemove = React.useCallback(() => {
    remove(name);
  }, [remove, name]);

  const handleChangeLanguage = React.useCallback(
    internalValue => {
      onChange({ name, value: { language: internalValue, level: undefined } });
    },
    [onChange, name]
  );

  const handleChangeLevel = React.useCallback(
    internalValue => {
      onChange({ name, value: { language: value.language, level: internalValue } });
    },
    [onChange, name, value.language]
  );

  const availableLanguages = languages.filter(language => {
    const isSelectedSomewhere = selectedValues.find((selected = {}) => selected.language === language.code);
    const isSelectedHere = value.language === language.code;

    return !isSelectedSomewhere || isSelectedHere;
  });
  const availableLabels = levelsByLanguage[value.language] || emptyLevels;

  const removeButtton = (
    <div
      css={`
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      `}
    >
      <StyledIconButton variant="unstyled" onClick={handleRemove}>
        <RemoveIcon />
      </StyledIconButton>
    </div>
  );

  return (
    <Row gutter={16} align="top">
      <Col md={12} xs={21}>
        <StyledFormItem
          name={[name, 'language']}
          validateTrigger={['onChange', 'onBlur']}
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Please select a language.',
            },
          ]}
        >
          <StyledLanguageSelect
            size="large"
            showSearch
            placeholder="Select a language..."
            optionFilterProp="description"
            onChange={handleChangeLanguage}
            value={value.language}
            dropdownRender={menu => <StyledLanguageDropdown>{menu}</StyledLanguageDropdown>}
          >
            {availableLanguages.map(({ code, name }) => {
              const Flag = getLanguageFlag(code);
              return (
                <Select.Option key={code} value={code} description={name}>
                  <StyledFlagContainer className="flag">
                    <Flag />
                  </StyledFlagContainer>
                  <span className="text">{name}</span>
                </Select.Option>
              );
            })}
          </StyledLanguageSelect>
        </StyledFormItem>
      </Col>
      <Col
        md={0}
        xs={3}
        css={`
          height: 5.75rem;
        `}
      >
        {removeButtton}
      </Col>

      <Col md={9} xs={21}>
        <StyledFormItem
          name={[name, 'level']}
          validateTrigger={['onChange', 'onBlur']}
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Please select a level.',
            },
          ]}
        >
          <StyledLevelSelect
            size="large"
            placeholder="Select a level..."
            value={value.level}
            onChange={handleChangeLevel}
            disabled={availableLabels.length === 0}
          >
            {availableLabels.map(({ code, name }) => {
              return (
                <Select.Option key={code} value={code} description={name}>
                  {name}
                </Select.Option>
              );
            })}
          </StyledLevelSelect>
        </StyledFormItem>
      </Col>

      <Col
        md={3}
        xs={0}
        css={`
          height: 5.75rem;
        `}
      >
        {removeButtton}
      </Col>
    </Row>
  );
}

LanguageSelectionCombobox.propTypes = {
  name: t.any.isRequired,
  value: t.shape({
    language: t.any,
    level: t.any,
  }),
  selectedValues: t.arrayOf(t.any),
  remove: t.func,
  onChange: t.func,
};

LanguageSelectionCombobox.defaultProps = {
  value: {
    language: undefined,
    level: undefined,
  },
  selectedValues: [],
  remove: () => {},
  onChange: () => {},
};

const StyledAlert = styled(Alert)`
  && {
    margin-bottom: 1rem;
  }
`;

const StyledJumboButton = styled(Button)`
  height: 5.75rem;
  border-radius: 0.75rem;
`;

const StyledDisclaimer = styled(Typography.Text)`
  display: block;
  margin: 4rem 0 2rem;
  color: ${props => props.theme.text.default};
  font-weight: 400;
`;

const AddIcon = createCustomIcon(_AddIcon);

const InfoIcon = createCustomIcon(_InfoIcon);

const ensureAtLeastOneLanguage = storedValues =>
  produce(storedValues, draft => {
    if (draft?.languages.length === 0) {
      draft.languages.push({
        language: undefined,
        level: undefined,
      });
    }
  });

export default function TranslatorSettings() {
  const location = useLocation();
  const message = location.state?.message;

  const [form] = Form.useForm();

  const [storedValues, setStoredValues] = useTranslatorSettings();
  const [values, setValues] = React.useState(ensureAtLeastOneLanguage(storedValues));

  const handleFinish = React.useCallback(
    values => {
      setStoredValues(values);

      notification.success({
        message: "You've updated your language skills settings!",
        placement: 'bottomRight',
        duration: 10,
      });
    },
    [setStoredValues]
  );

  const handleValuesChange = React.useCallback(
    (_, allValues) => {
      setValues(allValues);
    },
    [setValues]
  );

  const handleLanguageChange = React.useCallback(
    change => {
      setValues(values =>
        produce(values, () => {
          values.languages[change.name] = change.value;
        })
      );
    },
    [setValues]
  );

  const totalLanguagesReached = languages.length === values.languages.length;

  const renderItems = React.useCallback(
    (fields, { add, remove }) => {
      return (
        <>
          {fields.map((field, index) => {
            return (
              <LanguageSelectionCombobox
                key={field.key}
                name={field.name}
                selectedValues={values.languages}
                value={values.languages[field.name]}
                onChange={handleLanguageChange}
                remove={remove}
              />
            );
          })}

          <Form.Item>
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <StyledJumboButton
                  fullWidth
                  size="large"
                  variant="outlined"
                  icon={<AddIcon />}
                  disabled={totalLanguagesReached}
                  onClick={() => {
                    add();
                  }}
                >
                  New Language
                </StyledJumboButton>
              </Col>
            </Row>
          </Form.Item>
        </>
      );
    },
    [handleLanguageChange, totalLanguagesReached, values.languages]
  );

  return (
    <SingleCardLayout title="Set your language skills">
      {message && <StyledAlert closable showIcon icon={<InfoIcon />} message={message} type="info" />}
      <Form form={form} initialValues={values} onValuesChange={handleValuesChange} onFinish={handleFinish}>
        <Form.List name="languages">{renderItems}</Form.List>

        <StyledDisclaimer>
          <InfoIcon /> You can update your language level or add more languages anytime on settings.
        </StyledDisclaimer>

        <Row gutter={16} justify="space-between">
          <Col lg={6} md={8} sm={10} xs={12}>
            <Button fullWidth htmlType="reset" variant="outlined">
              Return
            </Button>
          </Col>

          <Col lg={6} md={8} sm={10} xs={12}>
            <Button fullWidth htmlType="submit">
              Save
            </Button>
          </Col>
        </Row>
      </Form>
    </SingleCardLayout>
  );
}
