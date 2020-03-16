import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import ReactBlockies from 'react-blockies';
import { Row, Typography, Skeleton, Divider } from 'antd';
import { createCustomIcon } from '~/adapters/antd';
import { useAccount, useAccountBalance, useDrizzle } from '~/adapters/drizzle';
import Button from '~/components/Button';
import * as r from '~/app/routes';
import { Popover, Button as TrayButton, Icon } from './adapters';
import _SettingsIcon from '~/assets/images/icon-settings.svg';
import EthLogo from '~/assets/images/logo-eth.svg';

const SettingsIcon = createCustomIcon(_SettingsIcon, Icon);

const StyledAccountRow = styled(Row)`
  align-items: center;

  a {
    color: ${props => props.theme.text.default};
  }

  a:hover {
    text-decoration: underline;
  }
`;

const StyledReactBlockies = styled(ReactBlockies)`
  border-radius: ${props => (props.shape === 'round' ? '100%' : 0)};
  width: 3.75rem;
  height 3.75rem;
`;

const StyledText = styled(Typography.Text)`
  font-size: 1.125rem;
  margin-left: 1rem;
  color: inherit;
`;

const StyledDiv = styled.div`
  color: ${props => props.theme.text.default};
  margin-left: auto;
  line-height: 1rem;

  svg {
    fill: currentColor;
    width: 0.875rem;
    height: 0.875rem;
  }
`;

function EthAccount({ address }) {
  return (
    <StyledAccountRow>
      <a
        href={`https://etherscan.io/address/${address}`}
        rel="noopener noreferrer"
        target="_blank"
        css={`
          display: flex;
          align-items: center;
        `}
      >
        <StyledReactBlockies seed={address} shape="round" size={10} scale={4} />
        <StyledText>
          {address.slice(0, 6)}...{address.slice(address.length - 4)}
        </StyledText>
      </a>
      <StyledDiv>
        Settings <SettingsIcon />
      </StyledDiv>
    </StyledAccountRow>
  );
}

EthAccount.propTypes = {
  address: t.string.isRequired,
};

const StyledContainer = styled.div`
  margin: 1rem 0;

  :last-child {
    margin-bottom: 0;
  }
`;

const StyledTitle = styled(Typography.Title)`
  && {
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
  }
`;

const StyledRow = styled(Row)`
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`;

const StyledEthLogo = styled(EthLogo)`
  flex: 2.4rem 0 0;
`;

const StyledDisplay = styled.span`
  color: ${props => props.theme.text.default};
  flex: auto 0 0;
  font-size: 2rem;
  line-height: 4rem;
  margin-left: 2rem;
`;

const StyledInnerContainer = styled.div`
  background-color: ${props => props.theme.background.default};
  border-radius: 0.75rem;
  padding: 1.5rem;
`;

function EthBalance({ amount, decimals, isLoading }) {
  const { drizzle } = useDrizzle();

  const content = isLoading ? (
    <Skeleton active paragraph={false} />
  ) : (
    Number(drizzle.web3.utils.fromWei(new drizzle.web3.utils.BN(amount))).toFixed(decimals)
  );

  return (
    <StyledContainer>
      <StyledInnerContainer>
        <StyledTitle
          level={3}
          css={`
            && {
              margin-top: -0.75rem;
              margin-bottom: -0.5rem;
            }
          `}
        >
          Balance
        </StyledTitle>
        <StyledRow>
          <StyledEthLogo />
          <StyledDisplay>{content} ETH</StyledDisplay>
        </StyledRow>
      </StyledInnerContainer>
    </StyledContainer>
  );
}

EthBalance.propTypes = {
  amount: t.string,
  decimals: t.number,
  isLoading: t.bool,
};

EthBalance.defaultProps = {
  amount: '0',
  isLoading: false,
  decimals: 18,
};

const StyledDivider = styled(Divider)`
  background-color: ${props => props.theme.background.light};
`;

function TranslatorSetup({ onClick }) {
  return (
    <StyledContainer>
      <StyledTitle>Translator</StyledTitle>
      <NavLink to={r.TRANSLATOR_SETUP}>
        <Button fullWidth onClick={onClick}>
          Update your language skills
        </Button>
      </NavLink>
    </StyledContainer>
  );
}

TranslatorSetup.propTypes = {
  onClick: t.func,
};

TranslatorSetup.defaultProps = {
  onClick: () => {},
};

function Settings() {
  const account = useAccount();
  const balance = useAccountBalance(account);

  const [visible, setVisible] = React.useState(false);

  const handleVisibilityChange = React.useCallback(visible => {
    setVisible(visible);
  }, []);

  const handleTranslatorSetupButtonClick = React.useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <Popover
      arrowPointAtCenter
      overlayStyle={{
        width: '32rem',
      }}
      content={
        <>
          <EthAccount address={account} />
          <StyledDivider />
          <EthBalance amount={balance} decimals={6} />
          <StyledDivider />
          <TranslatorSetup onClick={handleTranslatorSetupButtonClick} />
        </>
      }
      placement="bottomRight"
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibilityChange}
    >
      <TrayButton shape="round">
        <SettingsIcon />
      </TrayButton>
    </Popover>
  );
}

export default Settings;
