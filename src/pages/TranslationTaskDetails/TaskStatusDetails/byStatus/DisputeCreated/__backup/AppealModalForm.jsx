import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Typography, Form } from 'antd';
import { LoadingOutlined, CheckOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { mutate } from 'swr';
import { InputNumberWithAddons } from '~/adapters/antd';
import { subtract, max } from '~/adapters/bigNumber';
import { TaskParty, Dispute, useLinguo } from '~/app/linguo';
import { useWeb3React } from '~/app/web3React';
import { InfoIcon } from '~/components/icons';
import Button from '~/components/Button';
import Spacer from '~/components/Spacer';
import Modal from '~/components/Modal';
import EthValue, { valueOf, parse, getBestDisplayUnit } from '~/components/EthValue';
import wrapWithNotification from '~/utils/wrapWithNotification';
import useStateMachine from '~/hooks/useStateMachine';
import TaskContext from '../../../../TaskContext';
import DisputeContext from '../DisputeContext';
import AccountingTable from './AccountingTable';

const withNotification = wrapWithNotification({
  successMessage: 'You appealed the decision!',
  errorMessage: 'Failed to appeal the decision!',
});

const formStateMachine = {
  name: 'Translation Creation Form',
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
  idle: 'Appeal',
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

function AppealModalForm({ triggerElement, party, open }) {
  const [visible, setVisible] = React.useState(open);

  const handleTriggerClick = React.useCallback(evt => {
    evt.preventDefault();
    setVisible(true);
  }, []);
  const appealModalTrigger = React.cloneElement(triggerElement, { onClick: handleTriggerClick });

  const { appealCost, arbitrationCost } = React.useContext(DisputeContext);
  const arbitrationCostForParty = arbitrationCost[party];
  const totalAppealCost = Dispute.totalAppealCost({ appealCost, arbitrationCost }, { party });

  const bestUnit = getBestDisplayUnit({ amount: totalAppealCost });
  const totalAppealCostAsNumber = valueOf({ amount: totalAppealCost, unit: bestUnit.unit });

  const { deposit, crowdfunding, handleDepositChange } = useDepositValueSplit({
    totalAppealCost,
    unit: bestUnit.unit,
    initialValue: totalAppealCostAsNumber,
  });

  const [state, send] = useStateMachine(formStateMachine);
  const linguo = useLinguo();
  const { ID } = React.useContext(TaskContext);
  const { account } = useWeb3React();

  const [form] = Form.useForm();
  const formIsDisabled = state !== 'idle';

  const handleReset = React.useCallback(() => {
    form.resetFields();
    handleDepositChange(totalAppealCostAsNumber);
    setVisible(false);
  }, [handleDepositChange, totalAppealCostAsNumber, form]);

  const handleFinish = withNotification(async () => {
    send('SUBMIT');
    try {
      await linguo.api.fundAppeal({ ID, side: party }, { value: deposit, from: account });
      send('SUCCESS');
      handleReset();
      mutate(['getTaskDispute', ID], dispute => Dispute.registerAppealFunding(dispute, { deposit, party }));
    } catch (err) {
      send('ERROR');
      throw err;
    } finally {
      send('RESET');
    }
  });

  return (
    <>
      {appealModalTrigger}
      <AppealModal visible={visible} setVisible={setVisible} onCancel={handleReset}>
        <StyledForm
          hideRequiredMark
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          onReset={handleReset}
          initialValues={{
            deposit: totalAppealCostAsNumber,
          }}
        >
          <StyledFormExplainer>In order to proceed the following amount of ETH is required:</StyledFormExplainer>

          <Spacer />

          <StyledAccountingTable
            summary="Cost Breakdown"
            rows={[
              {
                description: 'Appeal Cost',
                value: <EthValue amount={appealCost} unit={bestUnit.unit} suffixType="short" />,
              },
              {
                description: 'Arbitration Fee',
                value: <EthValue amount={arbitrationCostForParty} unit={bestUnit.unit} suffixType="short" />,
              },
              {
                description: 'Total',
                value: <EthValue amount={totalAppealCost} unit={bestUnit.unit} suffixType="short" />,
                rowProps: { color: 'primary' },
              },
            ]}
          />

          <Spacer size={3} />

          <StyledFormItem
            label="Deposit"
            name="deposit"
            rules={[
              {
                required: true,
                message: 'Deposit cannot be empty.',
              },
              {
                type: 'number',
                min: 0.01,
                message: `Minimum deposit is 0.01 ${bestUnit.suffix.short}.`,
              },
            ]}
            extra={
              <>
                <Spacer baseSize="xs" size={0.5} />
                <StyledDepositDisclaimer>
                  <InfoIcon /> The remaining fees (Total - Deposit) will be crowdfunded.
                </StyledDepositDisclaimer>
              </>
            }
          >
            <InputNumberWithAddons
              noValidate
              size="large"
              type="number"
              min={0.01}
              max={totalAppealCostAsNumber}
              step={0.01}
              precision={2}
              addonAfter={bestUnit.suffix.short}
              onChange={handleDepositChange}
            />
          </StyledFormItem>

          <Spacer />

          <StyledAccountingTable
            summary="Remaining Value"
            rows={[
              {
                description: 'Crowdfunding',
                value: <EthValue amount={crowdfunding} unit={bestUnit.unit} suffixType="short" />,
              },
              {
                description: 'Total Due',
                value: <EthValue amount={deposit} unit={bestUnit.unit} suffixType="short" />,
              },
            ]}
          />

          <Spacer />

          <StyledButtonWrapper>
            <StyledButton variant="outlined" htmlType="reset" disabled={formIsDisabled}>
              Return
            </StyledButton>
            <StyledButton variant="filled" htmlType="submit" disabled={formIsDisabled}>
              {submitButtonContentByState[state]}
            </StyledButton>
          </StyledButtonWrapper>
        </StyledForm>
      </AppealModal>
    </>
  );
}

AppealModalForm.propTypes = {
  triggerElement: t.element.isRequired,
  party: t.oneOf([TaskParty.Translator, TaskParty.Challenger]).isRequired,
  open: t.bool,
};

AppealModalForm.defaultProps = {
  open: false,
};

export default AppealModalForm;

function useDepositValueSplit({ initialValue, totalAppealCost, unit }) {
  const [depositAsNumber, setDepositValue] = React.useState(initialValue);
  const handleDepositChange = React.useCallback(
    value => {
      setDepositValue(value || initialValue);
    },
    [initialValue]
  );

  const { deposit, crowdfunding } = React.useMemo(() => {
    const deposit = parse({ amount: depositAsNumber, unit });
    const crowdfunding = max(0, subtract(totalAppealCost, deposit));

    return { deposit, crowdfunding };
  }, [depositAsNumber, unit, totalAppealCost]);

  return { deposit, crowdfunding, handleDepositChange };
}

function AppealModal({ children, visible, setVisible, onCancel }) {
  const handleCancel = () => {
    setVisible(false);
    onCancel();
  };

  return (
    <Modal centered title="Appeal Fees" footer={null} visible={visible} onCancel={handleCancel}>
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

const StyledAccountingTable = styled(AccountingTable)``;

const StyledForm = styled(Form)`
  padding: 0.5rem;

  ${StyledAccountingTable} {
    font-size: ${p => p.theme.fontSize.lg};
  }
`;

const StyledFormExplainer = styled(Typography.Paragraph)`
  && {
    color: ${p => p.theme.color.text.default};
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: 400;
    text-align: center;
  }
`;

const StyledFormItem = styled(Form.Item)`
  && {
    padding: 1.5rem;
    border-radius: 0.75rem;
    background-color: ${p => p.theme.color.background.default};

    .ant-form-item-label > label {
      font-size: ${p => p.theme.fontSize.lg};
      font-weight: 400;
      color: ${p => p.theme.color.primary.default};
    }
  }
`;

const StyledDepositDisclaimer = styled(Typography.Text)`
  && {
    color: ${p => p.theme.color.text.default};
    font-size: ${p => p.theme.fontSize.xs};
    font-weight: 400;
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
