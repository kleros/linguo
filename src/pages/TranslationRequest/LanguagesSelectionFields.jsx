import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Form, Col } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { LanguageSelect } from '~/components/LanguageSelect';
import languages from '~/assets/fixtures/languages';
import Button from '~/components/Button';

const StyledWrapper = styled.div`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  width: 100%;
`;

const StyledLanguageSelectionFormItem = styled(Form.Item)`
  @media (min-width: 768px) {
    .ant-form-item-label {
      text-align: center;
    }
  }
`;

const StyledSwapButtonCol = styled(Col)`
  && {
    display: flex;
    justify-content: center;
    align-items: center;

    @media (min-width: 768px) {
      position: absolute;
      top: 40%;
      z-index: 10;
    }
  }
`;

const StyledSwapButton = styled(Button)`
  && {
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
      width: 100%;
      height: 100%;
    }
  }
`;

function LanguagesSelectionFields({ setFieldsValue }) {
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
    return languages.filter(language => seletectedLanguages.target !== language.code);
  }, [seletectedLanguages.target]);

  const availableTargetLanguages = React.useMemo(() => {
    return languages.filter(language => seletectedLanguages.source !== language.code);
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
    <StyledWrapper>
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
    </StyledWrapper>
  );
}

LanguagesSelectionFields.propTypes = {
  setFieldsValue: t.func.isRequired,
};

export default LanguagesSelectionFields;
