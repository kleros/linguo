import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { LoadingOutlined, UnlockOutlined } from '@ant-design/icons';
import { Col, Form, Input, Row, Select, Typography } from 'antd';
import { nanoid } from 'nanoid';
import { InputNumberWithAddons } from '~/adapters/antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import PriceDefinition1 from '~/assets/images/price-definition/01.svg';
import PriceDefinition2 from '~/assets/images/price-definition/02.svg';
import PriceDefinition3 from '~/assets/images/price-definition/03.svg';
import { selectLinguoTokenAddress } from '~/features/linguo/linguoSlice';
import {
  approve,
  selectAllTokens,
  selectInteractionTx,
  selectTokenByAddress,
  selectTokenByTicker,
} from '~/features/tokens/tokensSlice';
import TransactionState from '~/features/transactions/TransactionState';
import { selectAccount } from '~/features/web3/web3Slice';
import Button from '~/shared/Button';
import FormattedNumber from '~/shared/FormattedNumber';
import { InfoIcon } from '~/shared/icons';
import Spacer from '~/shared/Spacer';
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

function PriceDefinitionFields({ getFieldValue, validateFields }) {
  const allTokens = useShallowEqualSelector(selectAllTokens);
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

  const [minMaxPrice, setMinMaxPrice] = React.useState(0.01);
  const handleMinPriceChange = React.useCallback(value => {
    setMinMaxPrice(value);
  }, []);

  return (
    <>
      <Spacer />
      <StyledDetails>
        <summary>
          <InfoIcon /> Click to learn more about the price definition.
        </summary>
        <Spacer />
        <Row gutter={[48, 32]}>
          <StyledCol xs={24} sm={24} md={12} lg={8}>
            <PriceDefinition1 />
            <p>The pricing is market based.</p>
          </StyledCol>
          <StyledCol xs={24} sm={24} md={12} lg={8}>
            <PriceDefinition2 />
            <p>The price automatically increases until a translator is found.</p>
          </StyledCol>
          <StyledCol
            xs={{ span: 24, offset: 0 }}
            sm={{ span: 24, offset: 0 }}
            md={{ span: 12, offset: 6 }}
            lg={{ span: 8, offset: 0 }}
          >
            <PriceDefinition3 />
            <p>The more urgent the task, the faster the price goes up.</p>
          </StyledCol>
        </Row>
      </StyledDetails>
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
              allowanceValidation.status === AllowanceValidationStatus.pending
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
              {
                validator: async () => {
                  if (linguoTokenAddress === ADDRESS_ZERO) {
                    throw new Error('Please select languages first.');
                  }
                },
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
      {allowanceValidation.latestResult === AllowanceValidationStatus.invalid && (
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

const StyledCol = styled(Col)`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;

  svg {
    flex: 50% 1 2;
  }

  p {
    flex: 50% 2 1;
    color: ${p => p.theme.color.text.light};
    font-size: ${p => p.theme.fontSize.sm};
  }

  @media (max-width: 767.98px) {
    gap: 1.5rem;

    svg {
      flex-basis: 30%;
      min-width: 9rem;
      max-width: 12rem;
    }
  }

  @media (min-width: 768px) {
    :not(:first-of-type) {
      ::after {
        background: ${p => p.theme.color.secondary.default};
        content: '';
        position: absolute;
        z-index: 10;
        height: 0.25rem;
        width: 2rem;
        left: -1rem;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }

  @media (min-width: 768px) and (max-width: 1199.98px) {
    flex-direction: column;

    p,
    svg {
      flex: auto;
      max-width: 12rem;
      text-align: center;
    }

    :not(:first-of-type) {
      ::after {
        width: 15%;
        left: -7.5%;
        top: 30%;
      }
    }
  }
`;
