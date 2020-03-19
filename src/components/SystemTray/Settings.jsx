import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { NavLink } from 'react-router-dom';
import ReactBlockies from 'react-blockies';
import { Row, Col, Typography, Skeleton, Divider, Badge, Alert } from 'antd';
import { getErrorMessage } from '~/adapters/web3React';
import useWeb3ProviderSettings from '~/hooks/useWeb3ProviderSettings';
import { createCustomIcon } from '~/adapters/antd';
import Button from '~/components/Button';
import * as r from '~/app/routes';
import { injected } from '~/app/connectors';
import { Popover, Button as TrayButton, Icon } from './adapters';
import _SettingsIcon from '~/assets/images/icon-settings.svg';
import EthLogo from '~/assets/images/logo-eth.svg';

function ConnectionManager() {
  const { active, activate, deactivate, setError } = useWeb3React();
  const [providerSettings, saveSettings] = useWeb3ProviderSettings();

  const handleToggleConnection = React.useCallback(async () => {
    if (active) {
      deactivate();
      saveSettings({ allowEagerConnection: false });
    } else {
      try {
        await activate(injected, undefined, true);
        saveSettings({ allowEagerConnection: true });
      } catch (err) {
        setError(err);
        saveSettings({ allowEagerConnection: false });
      }
    }
  }, [active, deactivate, activate, setError, saveSettings]);

  React.useEffect(() => {
    if (!active && providerSettings.allowEagerConnection) {
      activate(injected);
    }
  }, [active, activate, providerSettings.allowEagerConnection]);

  const badgeColor = active ? 'green' : 'red';
  const connectionButtonText = active ? 'Disconnect' : 'Connect';

  return (
    <Button variant="outlined" size="small" onClick={handleToggleConnection}>
      <Badge color={badgeColor} /> {connectionButtonText}
    </Button>
  );
}

const SettingsIcon = createCustomIcon(_SettingsIcon, Icon);

const StyledSectionTitle = styled(Typography.Title)`
  && {
    color: ${props => props.theme.text.default};
    font-size: 0.875rem;
    line-height: 0.875rem;
    font-weight: 400;
    margin-bottom: 1rem;
  }
`;

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

const StyledAccountSkeleton = styled(Skeleton)`
  && {
    .ant-skeleton-avatar {
      border-radius: ${props => (props.shape === 'circle' ? '100%' : '0')};
    }
  }
`;

function EthAccount({ address }) {
  return (
    <StyledAccountRow>
      {address ? (
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
            {address.slice(0, 6)}...{address.slice(-4)}
          </StyledText>
        </a>
      ) : (
        <StyledAccountSkeleton avatar title shape="circle" size="large" paragraph={false} width="100%" />
      )}
    </StyledAccountRow>
  );
}

EthAccount.propTypes = {
  address: t.string,
};

EthAccount.defaultProps = {
  address: '',
};

const StyledSection = styled.section`
  margin: 1rem 0;

  :last-child {
    margin-bottom: 0;
  }
`;

const StyledBalanceInnerContainer = styled.div`
  background-color: ${props => props.theme.background.default};
  border-radius: 0.75rem;
  padding: 1.5rem;
`;

const StyledBalanceRow = styled(Row)`
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`;

const StyledEthLogo = styled(EthLogo)`
  flex: 2.4rem 0 0;
`;

const StyledBalanceDisplay = styled.span`
  color: ${props => props.theme.text.default};
  flex: auto 0 0;
  font-size: 2rem;
  line-height: 4rem;
  margin-left: 2rem;
`;

function EthBalance({ amount, decimals, isLoading }) {
  const title = (
    <StyledSectionTitle
      level={3}
      css={`
        && {
          text-align: center;
          margin-top: -0.75rem;
          margin-bottom: -0.5rem;
        }
      `}
    >
      Balance
    </StyledSectionTitle>
  );

  const content =
    amount === undefined ? (
      <>
        {title}
        <Skeleton active={isLoading} paragraph={false} />
      </>
    ) : (
      <StyledBalanceInnerContainer>
        {title}
        <StyledBalanceRow>
          <StyledEthLogo />
          <StyledBalanceDisplay>{Number(amount).toFixed(decimals)} ETH</StyledBalanceDisplay>
        </StyledBalanceRow>
      </StyledBalanceInnerContainer>
    );
  return <StyledSection>{content}</StyledSection>;
}

EthBalance.propTypes = {
  amount: t.string,
  decimals: t.number,
  isLoading: t.bool,
};

EthBalance.defaultProps = {
  isLoading: false,
  decimals: 18,
};

const getBalance = async ({ library, account }) => {
  if (!account) {
    throw new Error('Invalid account');
  }

  const balance = await library.eth.getBalance(account);
  return library.utils.fromWei(balance, 'ether');
};

function AccountInformation() {
  const { account, library, chainId } = useWeb3React();

  const [balance, setBalance] = React.useState({ isLoading: false, value: undefined });

  React.useEffect(() => {
    if (!!account && !!library) {
      let stale = false;
      setBalance({ isLoading: true });

      getBalance({ library, account })
        .then(balance => {
          if (!stale) {
            setBalance({
              isLoading: false,
              value: balance,
            });
          }
        })
        .catch(() => {
          if (!stale) {
            setBalance({
              isLoading: false,
              value: undefined,
            });
          }
        });

      return () => {
        stale = true;
        setBalance({
          isLoading: false,
          value: undefined,
        });
      };
    }
  }, [account, library, chainId]);

  return (
    <>
      <EthAccount address={account} />
      <StyledDivider />
      <EthBalance amount={balance.value} isLoading={balance.isLoading} decimals={6} />
    </>
  );
}

function TranslatorSetup({ onClick }) {
  return (
    <StyledSection>
      <StyledSectionTitle
        level={3}
        css={`
          text-align: center;
          && {
            font-weight: 500;
          }
        `}
      >
        Translator
      </StyledSectionTitle>
      <NavLink to={r.TRANSLATOR_SETTINGS}>
        <Button fullWidth onClick={onClick}>
          Update your language skills
        </Button>
      </NavLink>
    </StyledSection>
  );
}

TranslatorSetup.propTypes = {
  onClick: t.func,
};

TranslatorSetup.defaultProps = {
  onClick: () => {},
};

const StyledPopover = styled(Popover)`
  width: 32rem;
`;

const StyledDivider = styled(Divider)`
  background-color: ${props => props.theme.background.light};
`;

function Settings() {
  const { error } = useWeb3React();

  const [visible, setVisible] = React.useState(false);

  const handleVisibilityChange = React.useCallback(visible => {
    setVisible(visible);
  }, []);

  const handleTranslatorSetupButtonClick = React.useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <StyledPopover
      arrowPointAtCenter
      content={
        <>
          <Row
            gutter={16}
            align="middle"
            css={`
              margin-bottom: 1rem;
            `}
          >
            <Col span={18}>
              <ConnectionManager />
            </Col>
            <Col span={6}>
              <StyledSectionTitle
                level={3}
                css={`
                  text-align: right;
                  && {
                    margin-bottom: 0;

                    .anticon {
                      width: 0.875rem;
                      height: 0.875rem;
                      margin-left: 0.375rem;
                    }

                    svg {
                      fill: currentColor;
                    }
                  }
                `}
              >
                <span>Settings</span>
                <SettingsIcon />
              </StyledSectionTitle>
            </Col>
          </Row>
          {!error ? <AccountInformation /> : <Alert type="error" message={getErrorMessage(error)} />}
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
    </StyledPopover>
  );
}

export default Settings;
