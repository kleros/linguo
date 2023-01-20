import React from 'react';
import t from 'prop-types';
import produce from 'immer';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { Col, Form, Row } from 'antd';
import { Alert } from '~/adapters/antd';
import * as r from '~/app/routes';
import allLanguages from '~/assets/fixtures/languages';

import Button from '~/shared/Button';
import { AddIcon, RemoveIcon } from '~/shared/icons';
import { LanguageSelect, LevelSelect } from '~/shared/LanguageSelect';
import AffixContainer from '~/shared/AffixContainer';
import Spacer from '~/shared/Spacer';

import { useTranslatorSkills, EMPTY_SKILL } from '~/context/TranslatorSkillsProvider';

const emptyLevels = [];

export default function TranslatorSettingsForm() {
  const history = useHistory();
  const { state, actions, selectors } = useTranslatorSkills();
  const { updateSkills, clearSkills } = actions;
  const { selectAllSkills } = selectors;

  const [form] = Form.useForm();

  const [formState, setFormState] = React.useState({ skills: selectAllSkills(state) });

  const handleValuesChange = React.useCallback((_, allValues) => {
    setFormState(allValues);
  }, []);

  const resetLevelOnLanguageChange = React.useCallback(
    change => {
      if (change.item === 'language') {
        const skills = form.getFieldValue('skills');
        form.setFieldsValue({
          skills: produce(skills, draft => {
            draft[change.name].level = undefined;
          }),
        });
      }
    },
    [form]
  );

  const handleReturnClick = React.useCallback(() => {
    clearSkills();
  }, [clearSkills]);

  const handleFinish = React.useCallback(
    ({ skills }) => {
      updateSkills(skills);
      history.push(r.TRANSLATOR_DASHBOARD);
    },
    [history, updateSkills]
  );

  const totalLanguagesReached = allLanguages.length === formState.skills.length;

  return (
    <Form form={form} initialValues={formState} onValuesChange={handleValuesChange} onFinish={handleFinish}>
      <Form.List name="skills">
        {(fields, { add, remove }) => {
          return (
            <>
              {fields.map(field => {
                return (
                  <LanguageSelectionCombobox
                    key={field.key}
                    name={field.name}
                    selectedValues={formState.skills}
                    value={formState.skills[field.name]}
                    onChange={resetLevelOnLanguageChange}
                    remove={remove}
                  />
                );
              })}

              <Form.Item>
                <Row gutter={16}>
                  <Col lg={12} md={21} sm={21} xs={21}>
                    <StyledJumboButton
                      fullWidth
                      size="large"
                      variant="outlined"
                      icon={<AddIcon />}
                      disabled={totalLanguagesReached}
                      onClick={() => add(EMPTY_SKILL)}
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

      <Alert
        showIcon
        type="info"
        message="Linguo considers language skills as defined by the Common European Framework of Reference (CEFR)."
        description={
          <>
            <p>
              If the languages you speak are not part of the CEFR, please choose the level closer to what is described
              in this{' '}
              <a
                href="https://rm.coe.int/CoERMPublicCommonSearchServices/DisplayDCTMContent?documentId=090000168045bb52"
                target="_blank"
                rel="noopener noreferrer"
              >
                self-assessment grid
              </a>
              .
            </p>
            <p>
              <a
                href="https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions"
                target="_blank"
                rel="noopener noreferrer"
              >
                Click here to find out more about CEFR.
              </a>
            </p>
            <p>
              <strong>Important:</strong> You will only be able to work on tasks whose both source and target languages
              you have self-declared level B2 or higher.
            </p>
            <p>
              Learn more about this in our{' '}
              <Link
                to={{
                  pathname: r.FAQ,
                  hash: '#how-does-my-skill-levels-affect-the-amount-of-tasks-i-will-be-able-to-work-on-as-a-translator',
                }}
              >
                FAQ
              </Link>
              .
            </p>
          </>
        }
      />
      <Spacer size={2} />
      <AffixContainer>
        <Row gutter={16} justify="space-between">
          <Col xl={4} lg={6} md={8} sm={10} xs={12}>
            <Button fullWidth htmlType="button" variant="outlined" onClick={handleReturnClick}>
              Return
            </Button>
          </Col>
          <Col xl={4} lg={6} md={8} sm={10} xs={12}>
            <Button fullWidth htmlType="submit">
              Save
            </Button>
          </Col>
        </Row>
      </AffixContainer>
    </Form>
  );
}

const StyledJumboButton = styled(Button)`
  height: 5.75rem;
  border-radius: 0.75rem;
`;

const levelsByLanguage = allLanguages.reduce(
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
      onChange({ name, item: 'language', value: internalValue });
    },
    [onChange, name]
  );

  const handleChangeLevel = React.useCallback(
    internalValue => {
      onChange({ name, item: 'level', value: internalValue });
    },
    [onChange, name]
  );

  const availableLanguages = allLanguages.filter(language => {
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
      <StyledIconButton fullWidth variant="unstyled" onClick={handleRemove}>
        <RemoveIcon />
      </StyledIconButton>
    </div>
  );

  return (
    <Row gutter={16} align="top">
      <Col lg={12} md={21} sm={21} xs={21}>
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
        lg={0}
        md={3}
        sm={3}
        xs={3}
        css={`
          height: 5.75rem;
        `}
      >
        {removeButtton}
      </Col>

      <Col lg={9} md={21} sm={21} xs={21}>
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
        lg={3}
        md={0}
        sm={0}
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

const StyledIconButton = styled(Button)`
  && {
    transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
    color: #ccc;
    :not([disabled]):hover,
    :not([disabled]):focus,
    :not([disabled]):active {
      color: #999;
    }

    width: 100%;
    min-width: 2.5rem;
    max-width: 3rem;
    display: flex;
    justify-content: stretch;
    align-items: stretch;

    > span {
      width: 100%;

      > .anticon,
      > .anticon > svg {
        width: 100%;
        height: 100%;
      }
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
