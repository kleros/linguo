import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Form, Row, Col, Input, message } from 'antd';
import SingleFileUpload, { validator as singleFileUploadValidator } from '~/components/SingleFileUpload';

const StyledMiddleCol = styled(Col)`
  display: flex;
  justify-content: center;
  text-align: center;
  line-height: 2.5rem;

  @media (max-width: 767.98px) {
    margin-top: -2rem;
    margin-bottom: -0.5rem;
    justify-content: flex-start;
    text-align: right;
  }
`;

const StyledFormItem = styled(Form.Item)`
  && {
    margin-bottom: -2rem;
  }
`;

const normalizeFile = e => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const beforeUpload = file => {
  // do something...
  const isLt100M = file.size / 1024 / 1024 < 100;

  if (!isLt100M) {
    message.error('File must smaller than 100 MB!');
  }

  return isLt100M;
};

async function uploadValidator(rule, value) {
  if (!value || value.length === 0) {
    return '';
  }

  return singleFileUploadValidator(value);
}

function OriginalSourceFields({ setFieldsValue }) {
  const handleOriginalTextFileChange = React.useCallback(
    ({ fileList }) => {
      setFieldsValue({ originalTextFile: [...fileList] });
    },
    [setFieldsValue]
  );

  return (
    <Col span={24}>
      <Form.Item label="Source of the original text for context (optional)">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={14}>
            <StyledFormItem
              name="originalTextUrl"
              rules={[
                {
                  required: false,
                  type: 'url',
                  message: 'Please provide a valid URL.',
                },
              ]}
            >
              <Input size="large" placeholder="Paste a URL here" />
            </StyledFormItem>
          </Col>
          <StyledMiddleCol xs={24} sm={24} md={2}>
            or
          </StyledMiddleCol>
          <Col xs={24} sm={24} md={8}>
            <StyledFormItem
              name="originalTextFile"
              valuePropName="fileList"
              getValueFromEvent={normalizeFile}
              extra="Single file up to 100 MB"
              rules={[{ validator: uploadValidator }]}
            >
              <SingleFileUpload beforeUpload={beforeUpload} onChange={handleOriginalTextFileChange} />
            </StyledFormItem>
          </Col>
        </Row>
      </Form.Item>
    </Col>
  );
}

OriginalSourceFields.propTypes = {
  setFieldsValue: t.func.isRequired,
};

export default OriginalSourceFields;
