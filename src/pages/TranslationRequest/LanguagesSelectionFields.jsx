import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { SwapOutlined } from '@ant-design/icons';
import { Col, Form, Row } from 'antd';
import * as r from '~/app/routes';
import { getAvailableLanguagePairing } from '~/features/linguo';
import DismissableAlert from '~/features/ui/DismissableAlert';
import Button from '~/shared/Button';
import { LanguageSelect } from '~/shared/LanguageSelect';

export default function LanguagesSelectionFields({ setFieldsValue }) {
  const [seletectedLanguages, setSelectedLanguages] = React.useState({
    source: undefined,
    target: undefined,
  });

  const handleSourceLanguageChange = value => {
    setSelectedLanguages(current => ({ ...current, source: value }));
  };

  const handleTargetLanguageChange = value => {
    setSelectedLanguages(current => ({ ...current, target: value }));
  };

  const availableSourceLanguages = React.useMemo(() => {
    return getAvailableLanguagePairing(seletectedLanguages.target);
  }, [seletectedLanguages.target]);

  const availableTargetLanguages = React.useMemo(() => {
    return getAvailableLanguagePairing(seletectedLanguages.source);
  }, [seletectedLanguages.source]);

  const handleSwapLanguages = () => {
    setSelectedLanguages({
      source: seletectedLanguages.target,
      target: seletectedLanguages.source,
    });
    setFieldsValue({
      sourceLanguage: seletectedLanguages.target,
      targetLanguage: seletectedLanguages.source,
    });
  };

  return (
    <>
      <Col span={24} order={1}>
        <StyledDismissableAlert
          id="task.create.language-pairing"
          message="Currently it is only possible to request translations from or to English."
          description={
            <>
              Learn more about this on our{' '}
              <Link
                to={{
                  pathname: r.FAQ,
                  hash: '#why-does-linguo-only-support-translations-from-and-to-english',
                }}
              >
                FAQ page.
              </Link>
            </>
          }
        />
      </Col>
      <Col span={24} order={0}>
        <StyledNestedRow>
          <Col xs={24} sm={24} md={11} lg={10}>
            <StyledLanguageSelectionFormItem
              name="sourceLanguage"
              label="Source Language"
              rules={[
                {
                  required: true,
                  message: 'Please select a source language',
                },
              ]}
            >
              <LanguageSelect
                showSearch
                placeholder="Choose..."
                options={availableSourceLanguages}
                onChange={handleSourceLanguageChange}
              />
            </StyledLanguageSelectionFormItem>
          </Col>
          <StyledSwapButtonCol xs={24} sm={24}>
            <StyledSwapButton variant="unstyled" onClick={handleSwapLanguages}>
              <SwapOutlined />
            </StyledSwapButton>
          </StyledSwapButtonCol>
          <Col xs={24} sm={24} md={11} lg={10}>
            <StyledLanguageSelectionFormItem
              name="targetLanguage"
              label="Target Language"
              rules={[
                {
                  required: true,
                  message: 'Please select a target language',
                },
              ]}
            >
              <LanguageSelect
                showSearch
                placeholder="Choose..."
                options={availableTargetLanguages}
                onChange={handleTargetLanguageChange}
              />
            </StyledLanguageSelectionFormItem>
          </Col>
        </StyledNestedRow>
      </Col>
    </>
  );
}

LanguagesSelectionFields.propTypes = {
  setFieldsValue: t.func.isRequired,
};

const StyledNestedRow = styled(Row)`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;

  @media (min-width: 768px) {
    gap: 16px;
  }
`;

const StyledLanguageSelectionFormItem = styled(Form.Item)`
  .ant-form-item-label {
    text-align: center;
  }
`;

const StyledSwapButtonCol = styled(Col)`
  && {
    display: flex;
    justify-content: center;
    align-items: center;

    @media (min-width: 768px) {
      position: absolute;
      top: 3.125rem;
      z-index: 10;
    }

    @media (max-width: 767.98px) {
      margin: -1rem 0 0.5rem;
    }
  }
`;

const StyledSwapButton = styled(Button)`
  && {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: ${props => props.theme.color.border.default};
    color: ${props => props.theme.color.primary.default};
    border-radius: 100%;
    padding: 0.25rem;

    @media (max-width: 767.98px) {
      transform: rotate(90deg) !important;
    }

    .anticon,
    .anticon > svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

const StyledDismissableAlert = styled(DismissableAlert)`
  margin-bottom: 1rem;
`;
