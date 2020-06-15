import React from 'react';
import t from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Form, Select, Input, Row, Col, Typography } from 'antd';
import { UnlockOutlined } from '@ant-design/icons';
import {
  selectAllTokens,
  selectTokenByTicker,
  selectTokenByAddress,
  checkAllowanceChannel,
  checkAllowance,
  approve,
} from '~/features/tokens/tokensSlice';
import { selectLinguoTokenAddress } from '~/features/linguo/linguoSlice';
import { selectAccount } from '~/features/web3/web3Slice';
import { InputNumberWithAddons } from '~/adapters/antd';
import { InfoIcon } from '~/components/icons';
import Button from '~/components/Button';
import Spacer from '~/components/Spacer';
import usePrevious from '~/hooks/usePrevious';

function PriceDefinitionFields({ getFieldValue, isFieldValidating, getFieldError }) {
  const ethNativeToken = useSelector(selectTokenByTicker('ETH'));
  const allTokens = useSelector(selectAllTokens);

  const [paymentTokenAddress, setPaymentTokenAddress] = React.useState(ethNativeToken.address);
  const handleChangePaymentTokenAddress = React.useCallback(value => {
    setPaymentTokenAddress(value);
  }, []);

  const paymentToken = useSelector(selectTokenByAddress(paymentTokenAddress));

  const [allowanceValidation, setAllowanceValidation] = React.useState('idle');

  const account = useSelector(selectAccount);
  const linguoTokenAddress = useSelector(selectLinguoTokenAddress);
  const dispatch = useDispatch();

  const createAllowanceValidator = ({ getFieldsValue }) => ({
    validator: async (_, value) => {
      setAllowanceValidation('idle');
      if (!value) {
        return;
      }

      const { token, account } = getFieldsValue(['token', 'account']);

      /**
       * If the paymentTokenAddress is ETH, there's no need to check for allowance
       */
      // eslint-disable-next-line security/detect-possible-timing-attacks
      if (ethNativeToken.address === token) {
        return;
      }

      dispatch(
        checkAllowance({
          amount: value,
          tokenAddress: token,
          owner: account,
          spender: linguoTokenAddress,
        })
      );

      setAllowanceValidation('pending');
      try {
        await getCheckAllowanceResponse();
        setAllowanceValidation('valid');
      } catch (err) {
        setAllowanceValidation('invalid');
        throw err;
      }
    },
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
            hasFeedback={paymentTokenAddress !== ethNativeToken.address}
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
              createAllowanceValidator,
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
      {allowanceValidation === 'invalid' && (
        <>
          <StyledDisclaimerText>
            <InfoIcon /> You need to unlock Linguo to spend {paymentToken.ticker} in your behalf.
          </StyledDisclaimerText>
          <Spacer />
          <Row gutter={16}>
            <Col>
              <SetAllowanceButton
                tokenAddress={paymentTokenAddress}
                owner={account}
                spender={linguoTokenAddress}
                amount={getFieldValue('maxPrice')}
                buttonProps={{
                  variant: 'outlined',
                  icon: <UnlockOutlined />,
                }}
              >
                Unlock {getFieldValue('maxPrice')} {paymentToken.ticker}
              </SetAllowanceButton>
            </Col>
            <Col>
              <SetAllowanceButton
                tokenAddress={paymentTokenAddress}
                owner={account}
                spender={linguoTokenAddress}
                amount={Infinity}
                buttonProps={{
                  variant: 'filled',
                  icon: <UnlockOutlined />,
                }}
              >
                Unlock {paymentToken.ticker} Permanently
              </SetAllowanceButton>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

PriceDefinitionFields.propTypes = {
  getFieldValue: t.func.isRequired,
  isFieldValidating: t.func,
  getFieldError: t.func,
};

export default PriceDefinitionFields;

function getCheckAllowanceResponse() {
  let res;
  let rej;

  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  checkAllowanceChannel.take(
    action => {
      if (checkAllowance.fulfilled.match(action)) {
        return res();
      }

      if (checkAllowance.rejected.match(action)) {
        const message = action.payload?.error?.message ?? 'Unknown error.';
        return rej(new Error(message));
      }
    },
    action => checkAllowance.fulfilled.match(action) || checkAllowance.rejected.match(action)
  );

  return promise;
}

function SetAllowanceButton({ tokenAddress, owner, spender, amount, buttonProps, children }) {
  const dispatch = useDispatch();

  const handleClick = React.useCallback(() => {
    console.log('Submitting...', { tokenAddress, owner, spender, amount });
    dispatch(approve({ tokenAddress, owner, spender, amount }));
  }, [dispatch, tokenAddress, owner, spender, amount]);
  return (
    <Button {...buttonProps} onClick={handleClick}>
      {children}
    </Button>
  );
}

SetAllowanceButton.propTypes = {
  tokenAddress: t.string.isRequired,
  owner: t.string,
  spender: t.string.isRequired,
  amount: t.number.isRequired,
  buttonProps: t.object,
  children: t.node.isRequired,
};

SetAllowanceButton.defaultProps = {
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
