import React from 'react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { Form, Col } from 'antd';
import { DatePicker } from '~/adapters/antd';

dayjs.extend(advancedFormat);

function isBefore1HourFromNow(current) {
  return !!current && dayjs(current) < dayjs().add(1, 'hour');
}

function isBeforeToday(current) {
  return !!current && dayjs(current) < dayjs().startOf('day');
}

function DeadlineField() {
  return (
    <>
      <Col md={24} lg={12}>
        <Form.Item
          label="Deadline"
          name="deadline"
          rules={[
            {
              required: true,
              message: 'Please choose a deadline.',
            },
            {
              validator: async (rule, value) => {
                if (isBefore1HourFromNow(value)) {
                  throw new Error(rule.message);
                }
              },
              message: 'Deadline must be at least 1 hour from now',
            },
          ]}
        >
          <DatePicker
            size="large"
            placeholder="Date and Hour of the Day"
            disabledDate={isBeforeToday}
            showToday={false}
            showNow={false}
            showTime={{
              defaultValue: dayjs('00:00:00', 'HH'),
              format: 'HH',
              showNow: false,
              use12Hours: false,
            }}
            format="MMMM Do[,] YYYY [at] HH:mm:ss [(Local Time)]"
          />
        </Form.Item>
      </Col>
    </>
  );
}

export default DeadlineField;
