import React from 'react';
import t from 'prop-types';
import { Col, Form, Row } from 'antd';
import { CheckOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import Button from '~/shared/Button';
import { InputNumberWithAddons } from '~/adapters/antd';
import { subtract } from '~/adapters/big-number';
import { EthUnit, getBestDisplayUnit, parse, valueOf } from '~/shared/EthValue';
import useStateMachine from '~/shared/useStateMachine';
import { useDispatch, useSelector } from 'react-redux';
import { selectAccount } from '~/features/web3/web3Slice';
import useTask from '../../../../useTask';
import { fundAppeal } from '~/features/disputes/disputesSlice';

export default function AppealContributionForm({ totalAppealCost, paidFees, party }) {
  const [form] = Form.useForm();

  const depositField = useDepositField({
    form,
    totalAppealCost,
    paidFees,
  });

  const initialValues = {
    deposit: depositField.initialValue,
  };

  /**
   * We need this because the way antd `InputNumber` works.
   *
   * The max value for the deposit field is the remaining cost to fund the appeal.
   * Since the appeal cost for each party might vary, the deposit field must be
   * re-rendered whenever the chosen side changes.
   *
   * When the re-render happens, the screen value of the input changes, however
   * the underlying value stored in `form` does not, even if we change `initialValues`.
   *
   * So in case the deposit for one party is set to 2 ETH, if the user choses the other
   * side whose max deposit is 1 ETH, the screen value of the input will change to 1 ETH,
   * however, the underlying value in the for will remain at 2 ETH. If the user tries to
   * submit the form, the validation for the deposit field will fail saying the max value
   * for deposit is 1 ETH. This is confusing because amount being displayed to the user
   * will be 1 ETH.
   *
   * This lead to inconsistencies also if no side is selected by default. The initial value
   * of the deposit field is 0 and the field itself is disabled. When the user choses one
   * side, the field is enabled and the screen value is automatically set to the `min` attribute,
   * which is `0.01`. However, the underlying value will still be 0, which will cause a
   * validation error saying the min value is 0.01 ETH.
   */
  const handleValuesChange = React.useCallback(
    (changedValues, allValues) => {
      if (changedValues.appealParty !== undefined) {
        const { parsed, numeric } = getRemainingCost({ totalAppealCost, paidFees });
        const remainingCost = { parsed, numeric };

        const currentDeposit = allValues.deposit;

        if (
          !form.isFieldTouched(['deposit', 'numeric']) ||
          currentDeposit.numeric > remainingCost.numeric ||
          currentDeposit.numeric === 0
        ) {
          form.setFieldsValue({
            deposit: remainingCost,
          });
        }
      }
    },
    [form, totalAppealCost, paidFees]
  );

  const [state, send] = useStateMachine(formStateMachine);
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const { id: taskId } = useTask();
  const disabled = state !== 'idle';

  const handleFinish = React.useCallback(
    async values => {
      const deposit = values.deposit.parsed;

      send('SUBMIT');
      try {
        await dispatch(
          fundAppeal(
            { taskId, account, party, deposit },
            {
              meta: {
                thunk: { id: taskId },
              },
            }
          )
        );
        send('SUCCESS');
      } catch (err) {
        send('ERROR');
      } finally {
        send('RESET');
      }
    },
    [dispatch, send, party, account, taskId]
  );

  return (
    <Form
      hideRequiredMark
      form={form}
      onFinish={handleFinish}
      onValuesChange={handleValuesChange}
      initialValues={initialValues}
      css={`
        &.ant-form-inline .ant-form-item {
          flex: 1;
        }
      `}
    >
      <Row gutter={[8, 8]}>
        <Col xs={24} sm={24} md={16}>
          <depositField.FormItem />
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Button fullWidth htmlType="sumbit" disabled={disabled} {...submitButtonPropsByState[state]} />
        </Col>
      </Row>
    </Form>
  );
}

AppealContributionForm.propTypes = {
  totalAppealCost: t.string.isRequired,
  paidFees: t.string.isRequired,
  party: t.number.isRequired,
};

const formStateMachine = {
  name: 'Appeal Modal Form',
  initial: 'idle',
  states: {
    idle: {
      on: {
        SUBMIT: 'submitting',
      },
    },
    submitting: {
      on: {
        SUCCESS: 'succeeded',
        ERROR: 'failed',
      },
    },
    succeeded: {
      on: {
        RESET: 'idle',
      },
    },
    failed: {
      on: {
        RESET: 'idle',
      },
    },
  },
};

const submitButtonPropsByState = {
  idle: {
    children: 'Fund',
  },
  submitting: {
    icon: <LoadingOutlined />,
    children: 'Submitting...',
  },
  success: {
    icon: <CheckOutlined />,
    children: 'Done!',
  },
  failed: {
    icon: <CloseCircleOutlined />,
    children: 'Failed!',
  },
};

const getRemainingCost = ({ totalAppealCost = '0', paidFees = '0' } = {}) => {
  const { unit, suffix } =
    totalAppealCost === '0'
      ? {
          unit: EthUnit.ether,
          suffix: {
            short: 'ETH',
            long: 'Ether',
          },
        }
      : getBestDisplayUnit({ amount: totalAppealCost });
  const remainingCost = subtract(totalAppealCost, paidFees);
  const remainingCostAsNumber = valueOf({ amount: remainingCost, unit });

  return {
    numeric: remainingCostAsNumber,
    parsed: remainingCost,
    unit,
    suffix,
  };
};

function useDepositField({ form, totalAppealCost = '0', paidFees = '0' } = {}) {
  const { unit, suffix, ...remainingCost } = getRemainingCost({ totalAppealCost, paidFees });

  const disabled = totalAppealCost === '0';

  const [value, setValue] = React.useState({
    numeric: remainingCost.numeric,
    parsed: remainingCost.numeric,
  });

  const handleChange = React.useCallback(
    value => {
      const parsedValue = parse({ amount: value || '0', unit });

      setValue({
        numeric: value,
        parsed: parsedValue,
      });
      form.setFieldsValue({
        deposit: {
          parsed: parsedValue,
        },
      });
    },
    [form, unit]
  );

  const rules = React.useMemo(
    () =>
      disabled
        ? [
            {
              required: true,
              message: 'Pick a side to be able to provide a deposit.',
            },
          ]
        : [
            {
              required: true,
              message: 'Deposit cannot be empty.',
            },
            {
              type: 'number',
              min: 0.01,
              message: `Minimum deposit is 0.01 ${suffix.short}`,
            },
            {
              type: 'number',
              max: remainingCost.numeric,
              message: `Maximum deposit is ${remainingCost.numeric} ${suffix.short}`,
            },
          ],
    [disabled, remainingCost.numeric, suffix.short]
  );

  const initialValue = React.useMemo(
    () => ({
      numeric: remainingCost.numeric,
      parsed: remainingCost.parsed,
    }),
    [remainingCost.numeric, remainingCost.parsed]
  );

  const FormItem = React.useCallback(() => {
    return (
      <>
        <DepositFormItem
          rules={rules}
          disabled={disabled}
          min={Math.min(0.01, remainingCost.numeric)}
          max={remainingCost.numeric}
          addonAfter={suffix.short}
          onChange={handleChange}
        />
        <Form.Item hidden name={['deposit', 'parsed']} disabled={disabled}>
          <input type="hidden" />
        </Form.Item>
      </>
    );
  }, [rules, disabled, remainingCost.numeric, suffix.short, handleChange]);

  return {
    initialValue,
    value,
    FormItem,
  };
}

function DepositFormItem({ rules, disabled, min, max, addonAfter, onChange }) {
  return (
    <Form.Item name={['deposit', 'numeric']} rules={rules} disabled={disabled}>
      <InputNumberWithAddons
        noValidate
        type="number"
        step={0.01}
        precision={2}
        disabled={disabled}
        min={min}
        max={max}
        addonAfter={addonAfter}
        onChange={onChange}
      />
    </Form.Item>
  );
}

DepositFormItem.propTypes = {
  rules: t.arrayOf(t.object).isRequired,
  disabled: t.bool.isRequired,
  min: t.number,
  max: t.number,
  addonAfter: t.node,
  onChange: t.func.isRequired,
};
