import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import produce from 'immer';
import styled from 'styled-components';
import { Row, Col, Form, Typography, Alert } from 'antd';
import * as r from '~/app/routes';
import { InfoIcon, AddIcon, RemoveIcon } from '~/shared/icons';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import { LanguageSelect, LevelSelect } from '~/shared/LanguageSelect';
import allLanguages from '~/assets/fixtures/languages';
import { saveSkills, cancelSaveSkills, selectAllSkills } from './translatorSlice';

const emptyLevels = [];

export default function TranslatorSettingsForm() {
  const [form] = Form.useForm();

  const storedSkills = useSelector(selectAllSkills);
  const [state, setState] = React.useState({ skills: ensureAtLeastOneEmptySkill(storedSkills) });

  const handleValuesChange = React.useCallback(
    (_, allValues) => {
      setState(allValues);
    },
    [setState]
  );

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

  const dispatch = useDispatch();

  const handleReturnClick = React.useCallback(() => {
    dispatch(cancelSaveSkills());
  }, [dispatch]);

  const handleFinish = React.useCallback(
    values => {
      dispatch(saveSkills(values));
    },
    [dispatch]
  );

  const totalLanguagesReached = allLanguages.length === state.skills.length;

  return (
    <Form form={form} initialValues={state} onValuesChange={handleValuesChange} onFinish={handleFinish}>
      <Form.List name="skills">
        {(fields, { add, remove }) => {
          return (
            <>
              {fields.map(field => {
                return (
                  <LanguageSelectionCombobox
                    key={field.key}
                    name={field.name}
                    selectedValues={state.skills}
                    value={state.skills[field.name]}
                    onChange={resetLevelOnLanguageChange}
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
        type="info"
        message="Linguo considers language skills as defined by the Common European Framework of Reference (CEFR)."
        description={
          <>
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
              <strong>IMPORTANT:</strong> You will only be able to see tasks whose both source and target languages you
              have self-declared level B2 or higher. Learn more about this in our{' '}
              <Link
                to={{
                  pathname: r.FAQ,
                  hash:
                    '#how-does-my-skill-levels-affect-the-amount-of-tasks-i-will-be-able-to-work-on-as-a-translator',
                }}
              >
                FAQ
              </Link>
              .
            </p>
          </>
        }
      />
      <Spacer />
      <StyledDisclaimer>
        <InfoIcon /> You can update your language level or add more languages anytime in settings.
      </StyledDisclaimer>
      <Spacer size={3} />
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
  );
}

const StyledJumboButton = styled(Button)`
  height: 5.75rem;
  border-radius: 0.75rem;
`;

const StyledDisclaimer = styled(Typography.Text)`
  display: block;
  color: ${props => props.theme.color.text.default};
  font-weight: 400;
`;

const EMPTY_SKILL = {
  language: undefined,
  level: undefined,
};

const ensureAtLeastOneEmptySkill = produce(skills => {
  if (skills.length === 0) {
    skills.push(EMPTY_SKILL);
  }
});

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
