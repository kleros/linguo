import React from 'react';
import styled from 'styled-components';
import { Form, Col, Input } from 'antd';

const nf = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  useGrouping: true,
  maximumFractionalDigits: 0,
});

const StyledFormItem = styled(Form.Item)`
  .ant-form-item-required {
    width: 100%;

    .word-count {
      margin-left: auto;
    }
  }
`;

function TextField() {
  const [wordCount, setWordCount] = React.useState('');

  const handleChange = evt => {
    const { value } = evt.target;

    const currentCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const suffix = currentCount === 1 ? 'word' : 'words';

    setWordCount(currentCount > 0 ? `${nf.format(currentCount)} ${suffix}` : '');
  };

  return (
    <Col span={24}>
      <StyledFormItem
        label={
          <>
            <span>Text to be translated (paste it here)</span>
            <span className="word-count">{wordCount}</span>
          </>
        }
        name="text"
        rules={[
          {
            required: true,
            whitespace: true,
            message: 'Please provide a text to be translated.',
          },
        ]}
      >
        <Input.TextArea
          size="large"
          rows={14}
          placeholder="Text to be translated. Should be plain text."
          onChange={handleChange}
        />
      </StyledFormItem>
    </Col>
  );
}

export default TextField;
