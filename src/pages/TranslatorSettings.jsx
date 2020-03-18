import React from 'react';
import t from 'prop-types';
import produce from 'immer';
import { useLocalStorage } from '@rehooks/local-storage';
import styled from 'styled-components';
import { Layout, Row, Col, Form, Select, Typography, notification } from 'antd';
import Card from '~/components/Card';
import Button from '~/components/Button';
import languages from '~/assets/fixtures/languages';
import getLanguageFlag from '~/components/helpers/getLanguageFlag';
import _RemoveIcon from '~/assets/images/icon-remove.svg';
import _AddIcon from '~/assets/images/icon-add.svg';
import _InfoIcon from '~/assets/images/icon-info.svg';
import { createCustomIcon } from '~/adapters/antd';

const StyledLayout = styled(Layout)`
  margin: 4rem;
  max-width: 68rem;

  @media (max-width: 575.98px) {
    margin: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
  }
`;

const StyledFlagContainer = styled.span`
  display: inline-block;
  width: 1rem;
  height: 1rem;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const StyledCard = styled(Card)`
  &.ant-card {
    box-shadow: 0 0.375rem 5.625rem ${props => props.theme.shadow.default};
    width: 100%;
  }

  .ant-card-head-title {
    font-size: ${props => props.theme.fontSize.xl};
    padding: 0;
  }

  .ant-card-body {
    padding: 5rem;
  }

  && {
    @media (max-width: 575.98px) {
      flex: auto;
      box-shadow: none;
      border-radius: 0;

      .ant-card-head {
        border-radius: 0;
      }

      .ant-card-body {
        padding: 2rem;
      }
    }
  }
`;

const emptyLevels = [];

const levelsByLanguage = languages.reduce(
  (acc, { code, levels }) =>
    Object.assign(acc, {
      [code]: levels,
    }),
  {}
);

const RemoveIcon = createCustomIcon(_RemoveIcon);

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
    <StyledIconButton variant="unstyled" onClick={handleRemove}>
      <RemoveIcon />
    </StyledIconButton>
  );

  return (
    <Row gutter={16}>
      <Col sm={12} xs={21}>
        <Form.Item
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
          <Select
            size="large"
            showSearch
            placeholder="Select a language..."
            optionFilterProp="description"
            onChange={handleChangeLanguage}
            value={value.language}
          >
            {availableLanguages.map(({ code, name }) => {
              const Flag = getLanguageFlag(code);
              return (
                <Select.Option key={code} value={code} description={name}>
                  <StyledFlagContainer>
                    <Flag />
                  </StyledFlagContainer>
                  <span>{name}</span>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </Col>
      <Col
        sm={0}
        xs={3}
        css={`
          text-align: right;
        `}
      >
        {removeButtton}
      </Col>

      <Col sm={9} xs={21}>
        <Form.Item
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
          <Select
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
          </Select>
        </Form.Item>
      </Col>
      <Col
        sm={3}
        xs={0}
        css={`
          text-align: right;
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

const AddIcon = createCustomIcon(_AddIcon);

const InfoIcon = createCustomIcon(_InfoIcon);

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

const defaultInitialValues = {
  languages: [
    {
      language: undefined,
      level: undefined,
    },
  ],
};

export default function TranslatorSettings() {
  const [form] = Form.useForm();
  const [storedValues, setStoredValues] = useLocalStorage('translatorSettings', defaultInitialValues);
  const [values, setValues] = React.useState(storedValues);

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
              <Col sm={12} xs={24}>
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
    <StyledLayout>
      <StyledCard title="Set your language skills">
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
      </StyledCard>
    </StyledLayout>
  );
}
