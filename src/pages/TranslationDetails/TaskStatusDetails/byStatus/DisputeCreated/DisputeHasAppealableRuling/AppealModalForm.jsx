import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import styled, { css } from 'styled-components';
import { Form, Radio, Row, Col, Alert } from 'antd';
import { LoadingOutlined, CheckOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { mutate } from 'swr';
import { InputNumberWithAddons } from '~/adapters/antd';
import { subtract } from '~/adapters/bigNumber';
import { TaskParty, Dispute, AppealSide, useLinguo } from '~/app/linguo';
import { useWeb3React } from '~/features/web3';
import Button from '~/components/Button';
import Spacer from '~/components/Spacer';
import Modal from '~/components/Modal';
import Deadline from '~/components/Deadline';
import AccountingTable from '~/components/AccountingTable';
import EthValue, { EthUnit, valueOf, parse, getBestDisplayUnit } from '~/components/EthValue';
import wrapWithNotification from '~/utils/wrapWithNotification';
import useStateMachine from '~/hooks/useStateMachine';
import TaskContext from '../../../../TaskContext';
import useCurrentParty from '../../../hooks/useCurrentParty';
import useAppealStatus from './useAppealStatus';

function AppealModalForm({ trigger, forceClose }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (forceClose) {
      setVisible(false);
    }
  }, [forceClose]);
  const handleTriggerClick = React.useCallback(evt => {
    evt.preventDefault();
    setVisible(true);
  }, []);

  const modalTrigger = React.cloneElement(trigger, { onClick: handleTriggerClick });

  const [form] = Form.useForm();

  const appealStatus = useAppealStatus();
  const party = useCurrentParty();

  const appealPartyField = useAppealPartyField({
    party,
    appealStatus,
  });
  const depositField = useDepositField({
    form,
    ...appealStatus.parties[appealPartyField.value],
  });

  const initialValues = {
    appealParty: appealPartyField.initialValue,
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
        const { parsed, numeric } = getRemainingCost(appealStatus.parties[changedValues.appealParty]);
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
    [form, appealStatus.parties]
  );

  const handleReset = React.useCallback(() => {
    form.resetFields();
    setVisible(false);
  }, [form]);

  const [state, send] = useStateMachine(formStateMachine);
  const linguo = useLinguo();
  const { ID } = React.useContext(TaskContext);
  const { account } = useWeb3React();

  const disabled = state !== 'idle';
  const handleFinish = withNotification(async values => {
    const deposit = values.deposit.parsed;
    const party = values.appealParty;

    send('SUBMIT');
    try {
      await linguo.api.fundAppeal({ ID, side: party }, { from: account, value: deposit });
      send('SUCCESS');
      mutate(['getTaskDispute', ID], dispute => Dispute.registerAppealFunding(dispute, { deposit, party }));
      handleReset();
    } catch (err) {
      send('ERROR');
      console.warn(err);
      throw err;
    } finally {
      send('RESET');
    }
  });

  const availableAppealParties = [TaskParty.Translator, TaskParty.Challenger].includes(party)
    ? [party]
    : [TaskParty.Translator, TaskParty.Challenger];

  const canContribute = availableAppealParties.some(availableParty => {
    const { hasPaidFee, remainingTime } = appealStatus.parties[availableParty];
    return !hasPaidFee && remainingTime > 0;
  });

  return (
    <div>
      {modalTrigger}
      <AppealModal visible={visible} setVisible={setVisible} onCancel={handleReset}>
        {canContribute ? (
          <StyledForm
            hideRequiredMark
            layout="vertical"
            form={form}
            onFinish={handleFinish}
            onReset={handleReset}
            onValuesChange={handleValuesChange}
            initialValues={initialValues}
          >
            <appealPartyField.FormItem
              showTranslator={availableAppealParties.includes(TaskParty.Translator)}
              showChallenger={availableAppealParties.includes(TaskParty.Challenger)}
            />
            <Spacer />
            <FundingSummary {...appealStatus.parties[appealPartyField.value]} />
            <Spacer />
            <depositField.FormItem />
            <Spacer />
            <StyledButtonWrapper>
              <StyledButton variant="outlined" htmlType="reset">
                Return
              </StyledButton>
              <StyledButton variant="filled" htmlType="submit" disabled={disabled}>
                {submitButtonContentByState[state]}
              </StyledButton>
            </StyledButtonWrapper>
          </StyledForm>
        ) : (
          <>
            <FundingSummary {...appealStatus.parties[party]} />
            <Spacer />
            <Alert
              showIcon
              type="success"
              message="Congratulations! Your side is completely funded. We will let you know if the appeal moves forward."
            />
          </>
        )}
      </AppealModal>
    </div>
  );
}

AppealModalForm.propTypes = {
  trigger: t.element.isRequired,
  forceClose: t.bool,
};

AppealModalForm.defaultProps = {
  forceClose: false,
};

export default AppealModalForm;

const withNotification = wrapWithNotification({
  successMessage: 'You contributed to the appeal!',
  errorMessage: 'Failed contribute to the appeal!',
});

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

const submitButtonContentByState = {
  idle: 'Fund',
  submitting: (
    <>
      <LoadingOutlined /> Submitting...
    </>
  ),
  success: (
    <>
      <CheckOutlined /> Done!
    </>
  ),
  failed: (
    <>
      <CloseCircleOutlined /> Failed!
    </>
  ),
};

const StyledForm = styled(Form)`
  color: ${p => p.theme.color.text.default};

  .ant-form-item {
    color: ${p => p.theme.color.text.default};
  }
`;

const StyledFormItem = styled(Form.Item)`
  ${p => p.disabled && 'opacity: 0.25'};

  .ant-form-item-label {
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: 500;
    text-align: center;
  }
`;

const StyledButton = styled(Button)``;

const StyledButtonWrapper = styled.div`
  display: flex;

  ${StyledButton} {
    flex: 10rem 0 1;
  }

  ${StyledButton}:first-of-type {
    margin-right: 1rem;
  }

  ${StyledButton}:last-of-type {
    margin-left: auto;
  }
`;

function AppealModal({ children, visible, setVisible, onCancel }) {
  const handleCancel = () => {
    setVisible(false);
    onCancel();
  };

  return (
    <Modal centered title="Fund the Appeal" footer={null} visible={visible} onCancel={handleCancel}>
      {children}
    </Modal>
  );
}

AppealModal.propTypes = {
  children: t.node.isRequired,
  visible: t.bool.isRequired,
  setVisible: t.func.isRequired,
  onCancel: t.func,
};

AppealModal.defaultProps = {
  onCancel: () => {},
};

function useAppealPartyField({ party, appealStatus }) {
  const initialValue = React.useMemo(() => {
    const defaultAppealParty = [TaskParty.Translator, TaskParty.Challenger].includes(party) ? party : undefined;

    const { hasPaidFee, remainingTime } = appealStatus.parties[defaultAppealParty] ?? {
      hasPaidFee: false,
      remainingTime: 0,
    };
    const canChoose = !hasPaidFee && remainingTime > 0;

    return canChoose ? defaultAppealParty : undefined;
  }, [party, appealStatus.parties]);

  const [appealParty, selectAppealParty] = React.useState(initialValue);

  const handleAppealPartyChange = React.useCallback(evt => {
    const { value } = evt.target;
    selectAppealParty(value);
  }, []);

  const FormItem = React.useCallback(
    ({ showTranslator, showChallenger }) => (
      <AppealPartyFormItem
        showTranslator={showTranslator}
        showChallenger={showChallenger}
        appealStatus={appealStatus}
        onChange={handleAppealPartyChange}
      />
    ),
    [appealStatus, handleAppealPartyChange]
  );

  return {
    initialValue,
    value: appealParty,
    FormItem,
  };
}

function AppealPartyFormItem({ showTranslator, showChallenger, appealStatus, onChange }) {
  return (
    <StyledFormItem
      name="appealParty"
      label="Which side do you want to fund?"
      onChange={onChange}
      rules={[
        {
          required: true,
          message: 'Please pick a side.',
        },
      ]}
    >
      <StyledRadioGroup>
        {showTranslator && (
          <AppealPartyOption party={TaskParty.Translator} {...appealStatus.parties[TaskParty.Translator]} />
        )}
        {showChallenger && (
          <AppealPartyOption party={TaskParty.Challenger} {...appealStatus.parties[TaskParty.Challenger]} />
        )}
      </StyledRadioGroup>
    </StyledFormItem>
  );
}

AppealPartyFormItem.propTypes = {
  showTranslator: t.bool.isRequired,
  showChallenger: t.bool.isRequired,
  appealStatus: t.object.isRequired,
  onChange: t.func.isRequired,
};

const StyledRadioGroup = styled(Radio.Group)`
  width: 100%;
  color: inherit;
`;

function AppealPartyOption({ appealSide, party, remainingTime, hasPaidFee }) {
  const disabled = hasPaidFee || remainingTime === 0;

  return (
    <StyledRadioWrapper className={clsx({ disabled })}>
      <Radio value={party} disabled={disabled}>
        <Row gutter={16}>
          <Col span={12}>
            <StyledSectionTitle>
              <StyledTitleCaption>{descriptionByAppealSide[appealSide]}</StyledTitleCaption>
              {descriptionByParty[party]}
            </StyledSectionTitle>
          </Col>
          <Col span={12}>
            <Deadline
              seconds={remainingTime}
              render={({ formattedValue, icon, endingSoon }) => (
                <StyledDeadlineContent gutter={8} className={endingSoon ? 'ending-soon' : ''}>
                  <Col>{icon}</Col>
                  <Col>
                    <StyledSectionTitle>
                      <StyledTitleCaption>{deadlineDescriptionByAppealSide[appealSide]}</StyledTitleCaption>
                      {formattedValue}
                    </StyledSectionTitle>
                  </Col>
                </StyledDeadlineContent>
              )}
            />
          </Col>
        </Row>
      </Radio>
    </StyledRadioWrapper>
  );
}

AppealPartyOption.propTypes = {
  appealSide: t.oneOf(Object.values(AppealSide)).isRequired,
  party: t.oneOf([TaskParty.Translator, TaskParty.Challenger]).isRequired,
  remainingTime: t.number.isRequired,
  hasPaidFee: t.bool.isRequired,
};

const descriptionByAppealSide = {
  [AppealSide.Tie]: 'Previous Round was a Tie',
  [AppealSide.Winner]: 'Previous Round Winner',
  [AppealSide.Loser]: 'Previous Round Loser',
};

const descriptionByParty = {
  [TaskParty.Translator]: 'Translator',
  [TaskParty.Challenger]: 'Challenger',
};

const deadlineDescriptionByAppealSide = {
  [AppealSide.Tie]: 'Deadline',
  [AppealSide.Winner]: 'Winner Dealine',
  [AppealSide.Loser]: 'Loser Deadline',
};

const StyledDeadlineContent = styled(Row)`
  font-size: ${p => p.theme.fontSize.sm};

  &.ending-soon {
    color: ${p => p.theme.color.danger.default};
  }
`;

const StyledRadioWrapper = styled.div`
  :first-of-type:not(:only-of-type) {
    border-bottom: 1px solid ${p => p.theme.color.secondary.default};
  }

  :not(.disabled):hover {
    background: ${p => p.theme.color.background.default};

    .ant-radio-inner,
    .ant-radio-inner:focus,
    .ant-radio-inner:hover {
      border-color: ${p => p.theme.color.secondary.default};

      ::after {
        background-color: ${p => p.theme.color.secondary.default};
      }
    }
  }

  &.disabled {
    .ant-radio,
    ${StyledDeadlineContent}.ending-soon {
      opacity: 0.25;
    }
  }

  .ant-radio-wrapper {
    display: flex;
    align-items: center;
    padding: 1rem 0;
    color: inherit;

    .ant-radio {
      order: 1;
    }

    .ant-radio-inner {
      width: 1.5rem;
      height: 1.5rem;

      ::after {
        width: 0.75rem;
        height: 0.75rem;
        top: 5px;
        left: 5px;
      }
    }

    > span:last-of-type {
      flex: 1;
    }
  }
`;

/*
 * FIXME: the @media here is a dirty hack to cope with antd `Form.Item` is
 * adding extra height to the rendered element if `white-space` is `normal`
 */
const StyledSectionTitle = styled.div`
  font-weight: 500;
  margin-bottom: 0;

  @media (max-width: 460px) {
    white-space: normal;
  }
`;

const StyledTitleCaption = styled.span`
  display: block;
  font-weight: 400;
`;

function FundingSummary({ totalAppealCost, paidFees }) {
  const { unit } = totalAppealCost === '0' ? EthUnit.ether.unit : getBestDisplayUnit({ amount: totalAppealCost });
  const remainingCost = subtract(totalAppealCost, paidFees);

  const disabled = totalAppealCost === '0';

  return (
    <StyledFundingSummary className={clsx({ disabled })}>
      <StyledFundingTitle>Appeal Deposit</StyledFundingTitle>
      <StyledAccountingTable
        summary="Deposit Breakdown"
        rows={[
          {
            description: 'Total deposit required',
            value: <EthValue amount={totalAppealCost} unit={unit} suffixType="short" />,
          },
          {
            description: 'Remaining deposit required',
            value: <EthValue amount={remainingCost} unit={unit} suffixType="short" />,
            rowProps: {
              css: css`
                font-weight: 500;
              `,
            },
          },
        ]}
      />
    </StyledFundingSummary>
  );
}

FundingSummary.propTypes = {
  totalAppealCost: t.string,
  paidFees: t.string,
};

FundingSummary.defaultProps = {
  totalAppealCost: '0',
  paidFees: '0',
};

const StyledFundingSummary = styled.div`
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: ${p => p.theme.color.background.default};
  color: ${p => p.theme.color.primary.default};
  transition: all ${p => p.theme.transition.default};

  &.disabled {
    opacity: 0.25;
  }
`;

const StyledFundingTitle = styled.h4`
  text-align: center;
  font-size: ${p => p.theme.fontSize.lg};
  color: inherit;
  margin-top: -0.75rem;
`;

const StyledAccountingTable = styled(AccountingTable)``;

const getRemainingCost = ({ totalAppealCost = '0', paidFees = '0' } = {}) => {
  const { unit, suffix } = totalAppealCost === '0' ? EthUnit.ether : getBestDisplayUnit({ amount: totalAppealCost });
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
      const parsedValue = parse({ amount: value, unit });

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
    <StyledFormItem
      label="How much do you want to fund?"
      name={['deposit', 'numeric']}
      dependencies={['appealParty']}
      rules={rules}
      disabled={disabled}
    >
      <InputNumberWithAddons
        noValidate
        type="number"
        size="large"
        step={0.01}
        precision={2}
        disabled={disabled}
        min={min}
        max={max}
        addonAfter={addonAfter}
        onChange={onChange}
      />
    </StyledFormItem>
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
