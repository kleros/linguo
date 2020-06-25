import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { nanoid } from 'nanoid';
import { LoadingOutlined, UnlockOutlined } from '@ant-design/icons';
import { Col, Form, Input, Row, Select, Typography } from 'antd';
import { InputNumberWithAddons } from '~/adapters/antd';
import { useShallowEqualSelector } from '~/adapters/reactRedux';
import Button from '~/components/Button';
import FormattedNumber from '~/components/FormattedNumber';
import { InfoIcon } from '~/components/icons';
import Spacer from '~/components/Spacer';
import usePreviousMatching from '~/features/shared/usePreviousMatching';
import { selectLinguoTokenAddress } from '~/features/tasks/linguoSlice';
import {
  approve,
  selectAllTokens,
  selectInteractionTx,
  selectTokenByAddress,
  selectTokenByTicker,
} from '~/features/tokens/tokensSlice';
import TransactionState from '~/features/transactions/TransactionState';
import { selectAccount } from '~/features/web3/web3Slice';
import useAllowanceValidation, { AllowanceValidationStatus } from './useAllowanceValidation';

function PriceDefinitionFields({ getFieldValue, validateFields }) {
  const ethNativeToken = useSelector(selectTokenByTicker('ETH'));
  const allTokens = useSelector(selectAllTokens);

  const [paymentTokenAddress, setPaymentTokenAddress] = React.useState(ethNativeToken.address);
  const handleChangePaymentTokenAddress = React.useCallback(value => {
    setPaymentTokenAddress(value);
  }, []);

  const paymentToken = useSelector(selectTokenByAddress(paymentTokenAddress));

  const account = useSelector(selectAccount);
  const linguoTokenAddress = useSelector(selectLinguoTokenAddress);

  const allowanceValidation = useAllowanceValidation({
    spender: linguoTokenAddress,
    shouldSkip: ({ token } = {}) => token === ethNativeToken.address,
  });

  const [minMaxPrice, setMinMaxPrice] = React.useState(0.01);
  const handleMinPriceChange = React.useCallback(value => {
    setMinMaxPrice(value);
  }, []);

  return (
    <>
      <StyledDisclaimerText
        css={`
          margin-bottom: -2rem;
        `}
      >
        <InfoIcon /> The pricing is market based. The prices are automatically increased until a translator is found.
        This also sets the priority of the task.
      </StyledDisclaimerText>
      <Spacer />
      <Row gutter={[16, 16]}>
        <Form.Item name="account" initialValue={account}>
          <Input type="hidden" />
        </Form.Item>
        <Col xs={24} sm={24} md={8}>
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
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            label="Minimum Price"
            name="minPrice"
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
              onChange={handleMinPriceChange}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <StyledAsyncFormItem
            hasFeedback={
              paymentTokenAddress !== ethNativeToken.address &&
              allowanceValidation.status === AllowanceValidationStatus.Pending
            }
            label="Maximum Price"
            name="maxPrice"
            dependencies={['token', 'minPrice']}
            rules={[
              {
                required: true,
                message: 'Please set a maximum price.',
              },
              {
                type: 'number',
                min: minMaxPrice,
                message: `Maximum price must be at least ${minMaxPrice} ${paymentToken.ticker}.`,
              },
              allowanceValidation.createValidator,
            ]}
          >
            <InputNumberWithAddons
              type="number"
              placeholder="e.g.: 2.5"
              min={minMaxPrice}
              step={0.01}
              addonAfter={paymentToken.ticker}
            />
          </StyledAsyncFormItem>
        </Col>
      </Row>
      {allowanceValidation.latestResult === AllowanceValidationStatus.Invalid && (
        <>
          <ApproveOptions
            status={allowanceValidation.status}
            onSuccess={validateFields}
            tokenAddress={paymentToken.address}
            tokenTicker={paymentToken.ticker}
            owner={account}
            spender={linguoTokenAddress}
            amount={getFieldValue('maxPrice')}
          />
        </>
      )}
    </>
  );
}

PriceDefinitionFields.propTypes = {
  getFieldValue: t.func.isRequired,
  validateFields: t.func.isRequired,
};

export default PriceDefinitionFields;

const StyledDisclaimerText = styled(Typography.Paragraph)`
  && {
    color: ${props => props.theme.color.text.default};
    font-size: ${props => props.theme.fontSize.small};
    font-weight: 400;
    margin-bottom: 0;

    & + & {
      margin-top: 1rem;
    }
  }
`;

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
  <StyledLanguageDropdown>{dropdownRender(menu)}</StyledLanguageDropdown>
);

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

const StyledLanguageDropdown = styled.div`
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

function ApproveOptions({ tokenAddress, tokenTicker, owner, spender, amount, onSuccess, onError }) {
  const [interactionKey, setInteractionKey] = React.useState(nanoid());
  const { txState } = useShallowEqualSelector(selectInteractionTx(interactionKey)) ?? {};
  const hasPendingInteraction = txState === TransactionState.Pending;

  const previousTxState = usePreviousMatching(txState, previous =>
    [TransactionState.Mined, TransactionState.Failed].includes(previous)
  );
  const shouldShowButtons = previousTxState !== TransactionState.Mined;

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
          <InfoIcon /> You need to unlock Linguo to spend {tokenTicker} in your behalf.
        </StyledDisclaimerText>
        <Spacer />
        <Row gutter={16}>
          <Col>
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
          </Col>
          <Col>
            <ApproveButton
              interactionKey={interactionKey}
              tokenAddress={tokenAddress}
              owner={owner}
              spender={spender}
              amount={Infinity}
              buttonProps={{
                disabled: hasPendingInteraction,
                variant: 'filled',
                icon: <UnlockOutlined />,
              }}
            >
              Unlock {tokenTicker} Permanently
            </ApproveButton>
          </Col>
          {hasPendingInteraction && (
            <Col
              css={`
                display: flex;
                align-items: center;
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
          )}
        </Row>
      </>
    )
  );
}

ApproveOptions.propTypes = {
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
