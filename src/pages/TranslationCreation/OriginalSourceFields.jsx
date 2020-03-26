import React from 'react';
import styled from 'styled-components';
import { Form, Row, Col, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Button from '~/components/Button';

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

function beforeUpload(file) {
  const isPdf = file.type === 'application/pdf';

  if (!isPdf) {
    message.error('You can only upload a PDF file!');
  }

  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error('File must smaller than 10MB!');
  }
  return isPdf && isLt10M;
}

async function handleUpload(...args) {
  console.log(args);
}

function OriginalSourceFields() {
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
              extra="Only PDF files up to 10 MB"
            >
              <Upload accept="application/pdf" beforeUpload={beforeUpload} customRequest={handleUpload}>
                <Button variant="outlined">
                  <UploadOutlined />
                  Upload a File
                </Button>
              </Upload>
            </StyledFormItem>
          </Col>
        </Row>
      </Form.Item>
    </Col>
  );
}

export default OriginalSourceFields;
