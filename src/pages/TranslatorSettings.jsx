import React from 'react';
import t from 'prop-types';
import produce from 'immer';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useSettings, TRANSLATOR } from '~/app/settings';
import { Row, Col, Form, Typography, notification } from 'antd';
import SingleCardLayout from '~/pages/layouts/SingleCardLayout';
import WithRouteMessage from '~/components/WithRouteMessage';
import { InfoIcon, AddIcon, RemoveIcon } from '~/components/icons';
import Button from '~/components/Button';
import { LanguageSelect, LevelSelect } from '~/components/LanguageSelect';
import languages from '~/assets/fixtures/languages';

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
  const availableLevels = levelsByLanguage[value.language] || emptyLevels;

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
          <LanguageSelect
            size="large"
            showSearch
            placeholder="Select a language..."
            optionFilterProp="description"
            onChange={handleChangeLanguage}
            value={value.language}
            options={availableLanguages}
          />
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
          <LevelSelect
            size="large"
            placeholder="Select a level..."
            value={value.level}
            onChange={handleChangeLevel}
            disabled={availableLevels.length === 0}
            options={availableLevels}
          />
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
  const [form] = Form.useForm();

  const [storedValues, setStoredValues] = useSettings(TRANSLATOR);
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

  const history = useHistory();
  const handleReturnClick = React.useCallback(() => {
    history.goBack();
  }, [history]);

  return (
    <SingleCardLayout title="Set your language skills">
      <WithRouteMessage>
        <Form form={form} initialValues={values} onValuesChange={handleValuesChange} onFinish={handleFinish}>
          <Form.List name="languages">
            {(fields, { add, remove }) => {
              return (
                <>
                  {fields.map(field => {
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
            }}
          </Form.List>

          <StyledDisclaimer>
            <InfoIcon /> You can update your language level or add more languages anytime on settings.
          </StyledDisclaimer>

          <Row gutter={16} justify="space-between">
            <Col lg={6} md={8} sm={10} xs={12}>
              <Button fullWidth htmlType="button" variant="outlined" onClick={handleReturnClick}>
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
      </WithRouteMessage>
    </SingleCardLayout>
  );
}
