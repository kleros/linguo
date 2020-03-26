import React from 'react';
import { Form, Col, Input } from 'antd';

function TitleField() {
  return (
    <Col span={24}>
      <Form.Item
        label="Title"
        name="title"
        rules={[
          {
            required: true,
            whitespace: true,
            message: 'Please provide a title.',
          },
        ]}
      >
        <Input size="large" placeholder="Translation Title" />
      </Form.Item>
    </Col>
  );
}

export default TitleField;
