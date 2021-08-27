import React from 'react';
import t from 'prop-types';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import { Form, Col } from 'antd';
import { DatePicker } from '~/adapters/antd';

dayjs.extend(localizedFormat);
dayjs.extend(utc);
/**
 * The plugins below are required to work with DatePicker component from antd@4.5.x
 */
dayjs.extend(weekday);
dayjs.extend(localeData);

export default function DeadlineField({ setFieldsValue }) {
  const handleDateChange = React.useCallback(
    value => {
      const parsedValue = dayjs(value);
      if (parsedValue.isValid()) {
        setFieldsValue({ deadline: parsedValue.utc().endOf('day') });
      }
    },
    [setFieldsValue]
  );

  return (
    <>
      <Col xs={24} sm={24} md={24} lg={8}>
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
            inputReadOnly
            allowClear={false}
            size="large"
            placeholder="Choose a date"
            disabledDate={isBeforeToday}
            showToday={false}
            showNow={false}
            format="lll [(UTC)]"
            onChange={handleDateChange}
          />
        </Form.Item>
      </Col>
    </>
  );
}

DeadlineField.propTypes = {
  setFieldsValue: t.func.isRequired,
};

function isBefore1HourFromNow(current) {
  return !!current && dayjs(current) < dayjs().add(1, 'hour');
}

function isBeforeToday(current) {
  return !!current && dayjs(current) < dayjs().startOf('day');
}
