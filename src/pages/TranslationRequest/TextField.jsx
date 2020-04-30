import React from 'react';
import styled from 'styled-components';
import { Form, Col, Input } from 'antd';
import FormattedNumber from '~/components/FormattedNumber';
import { Task } from '~/app/linguo';

const StyledFormItem = styled(Form.Item)`
  .ant-form-item-required {
    width: 100%;

    .word-count {
      margin-left: auto;
    }
  }
`;

const pluralize = (quantity, { single, many }) => (quantity === 1 ? single : many);

function TextField() {
  const [wordCount, setWordCount] = React.useState('');

  const handleChange = evt => {
    const { value } = evt.target;
    setWordCount(Task.wordCount({ text: value }));
  };

  return (
    <Col span={24}>
      <StyledFormItem
        label={
          <>
            <span>Text to be translated (paste it here)</span>
            <span className="word-count">
              {wordCount > 0 ? (
                <>
                  <FormattedNumber value={wordCount} />
                  <span>{' ' + pluralize(wordCount, { single: 'word', many: 'words' })}</span>
                </>
              ) : null}
            </span>
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
