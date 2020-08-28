import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { LoadingOutlined, UnlockOutlined } from '@ant-design/icons';
import { Col, Form, Input, Row, Select, Typography } from 'antd';
import { nanoid } from 'nanoid';
import { InputNumberWithAddons } from '~/adapters/antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { selectLinguoTokenAddress } from '~/features/linguo/linguoSlice';
import { normalizeBaseUnit } from '~/features/tokens';
import {
  approve,
  selectSupportedTokens,
  selectInteractionTx,
  selectTokenByAddress,
  selectTokenByTicker,
} from '~/features/tokens/tokensSlice';
import TransactionState from '~/features/transactions/TransactionState';
import { selectAccount } from '~/features/web3/web3Slice';
import Button from '~/shared/Button';
import FormattedNumber from '~/shared/FormattedNumber';
import { InfoIcon, WarningIcon } from '~/shared/icons';
import Spacer from '~/shared/Spacer';
import PriceDefinitionInfographic from '~/shared/PriceDefinitionInfographic';
import usePreviousMatching from '~/shared/usePreviousMatching';
import useAllowanceValidation, { AllowanceValidationStatus } from './useAllowanceValidation';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export default function PriceDefinitionFieldsWrapper() {
  return (
    <Form.Item
      noStyle
      dependencies={['sourceLanguage', 'targetLanguage']}
      shouldUpdate={(prev, current) =>
        prev.sourceLanguage !== current.sourceLanguage || prev.targetLanguage !== current.targetLanguage
      }
    >
      {form => <PriceDefinitionFields {...form} />}
    </Form.Item>
  );
}

function PriceDefinitionFields({ getFieldValue, setFieldsValue, validateFields }) {
  const allTokens = useShallowEqualSelector(selectSupportedTokens);
  const ethNativeToken = useSelector(selectTokenByTicker('ETH'));

  const [paymentTokenAddress, setPaymentTokenAddress] = React.useState(ethNativeToken.address);
  const handleChangePaymentTokenAddress = React.useCallback(value => {
    setPaymentTokenAddress(value);
  }, []);

  const paymentToken = useSelector(selectTokenByAddress(paymentTokenAddress));

  const account = useSelector(selectAccount);
  const linguoTokenAddress = useSelector(
    selectLinguoTokenAddress({
      sourceLanguage: getFieldValue('sourceLanguage'),
      targetLanguage: getFieldValue('targetLanguage'),
    })
  );

  const allowanceValidation = useAllowanceValidation({
    spender: linguoTokenAddress,
    shouldSkip: ({ token } = {}) => token === ethNativeToken.address,
  });

  const [minMaxPriceNumeric, setMinMaxPriceNumeric] = React.useState(0.01);
  const handleMinPriceNumericChange = React.useCallback(
    value => {
      setMinMaxPriceNumeric(value);

      if (!Number.isNaN(parseInt(value, 10))) {
        setFieldsValue({
          minPrice: normalizeBaseUnit(value, paymentToken.decimals),
        });
      }
    },
    [setFieldsValue, paymentToken.decimals]
  );

  const handleMaxPriceNumericChange = React.useCallback(
    value => {
      if (!Number.isNaN(parseInt(value, 10))) {
        setFieldsValue({
          maxPrice: normalizeBaseUnit(value, paymentToken.decimals),
        });
      }
    },
    [setFieldsValue, paymentToken.decimals]
  );

  return (
    <>
      <Row gutter={[16, 16]}>
        <Form.Item name="account" initialValue={account}>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="minPrice" initialValue="0">
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="maxPrice" initialValue="0">
          <Input type="hidden" />
        </Form.Item>
        <Col xs={24} sm={24} md={12} lg={8}>
          <Form.Item
            label="Currency"
            initialValue={ethNativeToken.address}
            name="token"
            rules={[
              {
                required: true,
                message: 'Please select a token.',
              },
            ]}
          >
            <TokenSelect
              showSearch
              placeholder="Select a token..."
              optionFilterProp="value"
              size="large"
              onChange={handleChangePaymentTokenAddress}
              options={allTokens}
            />
          </Form.Item>
        </Col>
        <Col xs={0} md={12} lg={0}></Col>
        <Col xs={24} sm={24} md={12} lg={8}>
          <Form.Item
            label="Minimum Price"
            name="minPriceNumeric"
            rules={[
              {
                required: true,
                message: 'Please set a minimum price.',
              },
              {
                type: 'number',
                min: 0.01,
                message: `Minimum price must be at least 0.01 ${paymentToken.ticker}.`,
              },
            ]}
          >
            <InputNumberWithAddons
              type="number"
              placeholder="e.g.: 1.2"
              min={0.01}
              step={0.01}
              addonAfter={paymentToken.ticker}
              onChange={handleMinPriceNumericChange}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={8}>
          <StyledAsyncFormItem
            validateFirst
            hasFeedback={
              paymentTokenAddress !== ethNativeToken.address &&
              allowanceValidation.status === AllowanceValidationStatus.pending
            }
            label="Maximum Price"
            name="maxPriceNumeric"
            dependencies={['token', 'minPriceNumeric']}
            rules={[
              {
                required: true,
                message: 'Please set a maximum price.',
              },
              {
                type: 'number',
                min: minMaxPriceNumeric,
                message: `Maximum price must be at least ${minMaxPriceNumeric} ${paymentToken.ticker}.`,
              },
              {
                validator: async () => {
                  if (linguoTokenAddress === ADDRESS_ZERO) {
                    throw new Error('Please select the languages first.');
                  }
                },
              },
              allowanceValidation.createValidator,
            ]}
          >
            <InputNumberWithAddons
              type="number"
              placeholder="e.g.: 2.5"
              min={minMaxPriceNumeric}
              step={0.01}
              addonAfter={paymentToken.ticker}
              onChange={handleMaxPriceNumericChange}
            />
          </StyledAsyncFormItem>
        </Col>
      </Row>
      <StyledDetails>
        <summary>
          <InfoIcon /> Click to learn more about the price definition.
        </summary>
        <Spacer />
        <PriceDefinitionInfographic />
      </StyledDetails>
      <Spacer />
      {allowanceValidation.latestResult === AllowanceValidationStatus.invalid && (
        <>
          <ApproveOptions
            status={allowanceValidation.status}
            onSuccess={validateFields}
            tokenAddress={paymentToken.address}
            tokenTicker={paymentToken.ticker}
            owner={account}
            spender={linguoTokenAddress}
            amount={getFieldValue('maxPriceNumeric')}
          />
        </>
      )}
    </>
  );
}

PriceDefinitionFields.propTypes = {
  getFieldValue: t.func.isRequired,
  validateFields: t.func.isRequired,
  setFieldsValue: t.func.isRequired,
};

function TokenSelect({ dropdownRender, options, ...props }) {
  const wrappedDropdownRender = React.useMemo(() => makeDropdownRender(dropdownRender), [dropdownRender]);

  return (
    <StyledSelect {...props} optionFilterProp="description" dropdownRender={wrappedDropdownRender}>
      {options.map(({ ticker, name, address, logo }) => {
        return (
          <Select.Option key={address} value={address} description={ticker}>
            <span className="logo">
              <img src={logo} alt={ticker} />
            </span>
            <span className="text">
              {ticker} ({name})
            </span>
          </Select.Option>
        );
      })}
    </StyledSelect>
  );
}

TokenSelect.propTypes = {
  dropdownRender: t.func,
  options: t.arrayOf(
    t.shape({
      ticker: t.string.isRequired,
      name: t.string.isRequired,
      logo: t.string.isRequired,
    })
  ),
};

TokenSelect.defaultProps = {
  dropdownRender: menu => menu,
  options: [],
};

const makeDropdownRender = dropdownRender => menu => (
  <StyledCurrencyDropdown>{dropdownRender(menu)}</StyledCurrencyDropdown>
);

function ApproveOptions({ status, tokenAddress, tokenTicker, owner, spender, amount, onSuccess, onError }) {
  const [interactionKey, setInteractionKey] = React.useState(nanoid());
  const { txState } = useShallowEqualSelector(selectInteractionTx(interactionKey)) ?? {};
  const hasPendingInteraction = txState === TransactionState.Pending;

  const previousTxState = usePreviousMatching(txState, previous =>
    [TransactionState.Mined, TransactionState.Failed].includes(previous)
  );
  const shouldShowButtons = status === AllowanceValidationStatus.invalid || previousTxState !== TransactionState.Mined;

  React.useEffect(() => {
    if (txState === TransactionState.Mined) {
      onSuccess();
      setInteractionKey(nanoid());
    }

    if (txState === TransactionState.Failed) {
      onError();
      setInteractionKey(nanoid());
    }
  }, [onSuccess, onError, txState]);

  return (
    shouldShowButtons && (
      <>
        <StyledDisclaimerText>
          <WarningIcon /> You need to unlock Linguo to spend {tokenTicker} in your behalf.
        </StyledDisclaimerText>
        <Spacer />
        <Row
          gutter={[16, 16]}
          css={`
            position: relative;
          `}
        >
          <StyledApproveButtonCol>
            <ApproveButton
              interactionKey={interactionKey}
              tokenAddress={tokenAddress}
              owner={owner}
              spender={spender}
              amount={amount}
              buttonProps={{
                disabled: hasPendingInteraction,
                variant: 'outlined',
                icon: <UnlockOutlined />,
              }}
            >
              <>
                Unlock <FormattedNumber value={amount} decimals={2} /> {tokenTicker}
              </>
            </ApproveButton>
          </StyledApproveButtonCol>
          <StyledApproveButtonCol>
            <ApproveButton
              interactionKey={interactionKey}
              tokenAddress={tokenAddress}
              owner={owner}
              spender={spender}
              amount={Infinity}
              buttonProps={{
                disabled: hasPendingInteraction,
                variant: 'outlined',
                color: 'secondary',
                icon: <UnlockOutlined />,
              }}
            >
              Unlock {tokenTicker} Permanently
            </ApproveButton>
          </StyledApproveButtonCol>
          {hasPendingInteraction ? (
            <Col
              css={`
                display: flex;
                align-items: center;

                @media (max-width: 991.98px) {
                  justify-content: center;
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  transform: translate(-50%, -50%);
                }
              `}
            >
              <LoadingOutlined
                css={`
                  > svg {
                    width: 1.5rem;
                    height: 1.5rem;
                  }
                `}
              />
            </Col>
          ) : null}
        </Row>
      </>
    )
  );
}

ApproveOptions.propTypes = {
  status: t.oneOf(Object.values(AllowanceValidationStatus)).isRequired,
  tokenAddress: t.string.isRequired,
  tokenTicker: t.string.isRequired,
  owner: t.string.isRequired,
  spender: t.string.isRequired,
  amount: t.oneOfType([t.number, t.string]).isRequired,
  onSuccess: t.func,
  onError: t.func,
};

ApproveOptions.defaultProps = {
  onSuccess: () => {},
  onError: () => {},
};

function ApproveButton({ interactionKey, tokenAddress, owner, spender, amount, buttonProps, children }) {
  const dispatch = useDispatch();

  const handleClick = React.useCallback(() => {
    dispatch(
      approve({
        key: interactionKey,
        tokenAddress,
        owner,
        spender,
        amount,
      })
    );
  }, [interactionKey, dispatch, tokenAddress, owner, spender, amount]);
  return (
    <Button {...buttonProps} onClick={handleClick}>
      {children}
    </Button>
  );
}

ApproveButton.propTypes = {
  interactionKey: t.string.isRequired,
  tokenAddress: t.string.isRequired,
  owner: t.string,
  spender: t.string.isRequired,
  amount: t.oneOfType([t.number, t.string]).isRequired,
  buttonProps: t.object,
  children: t.node.isRequired,
};

ApproveButton.defaultProps = {
  buttonProps: {},
};

const StyledSelect = styled(Select)`
  &&& {
    .ant-select-selector {
      .ant-select-selection-placeholder,
      .ant-select-selection-item {
        display: flex;
        align-items: center;
      }

      .ant-select-selection-item {
        .logo {
          flex: 1rem 0 0;
          margin-right: 0.5rem;

          > img {
            display: block;
            display: block;
            width: 100%;
          }
        }

        .text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
`;

const StyledCurrencyDropdown = styled.div`
  .ant-select-item-option-content {
    display: flex;
    align-items: center;

    .logo {
      flex: 1rem 0 0;
      margin-right: 0.5rem;

      > img {
        display: block;
        width: 100%;
      }
    }

    .text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const StyledAsyncFormItem = styled(Form.Item)`
  && {
    &.ant-form-item-has-feedback .ant-form-item-children-icon {
      right: 76px;
    }
  }
`;

const StyledDisclaimerText = styled(Typography.Paragraph)`
  && {
    color: ${props => props.theme.color.text.default};
    font-size: ${props => props.theme.fontSize.small};
    margin-bottom: 0;

    & + & {
      margin-top: 1rem;
    }
  }
`;

const StyledDetails = styled.details`
  &[open] {
    > summary {
      color: ${p => p.theme.color.text.default};
    }
  }

  > summary {
    cursor: help;
    outline: none;
    transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
    color: ${p => p.theme.color.text.light};

    &:focus,
    &:hover {
      color: ${p => p.theme.color.text.default};
    }

    &::-webkit-details-marker {
      display: none;
    }

    ::marker {
      display: none;
      content: '';
    }
  }
`;

const StyledApproveButtonCol = styled(Col)`
  @media (max-width: 767.98px) {
    flex: 0 0 100%;

    > button {
      width: 100%;
    }
  }

  @media (min-width: 768px) {
    flex: 0 1 50%;

    > button {
      width: 100%;
    }
  }

  @media (min-width: 992px) {
    flex: 0;
  }
`;
