import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Row, Col, Typography, Divider, Alert } from 'antd';
import { getErrorMessage } from '~/adapters/web3React';
import { useWeb3React } from '~/app/web3React';
import * as r from '~/app/routes';
import { SettingsIcon } from '~/components/icons';
import Button from '~/components/Button';
import WalletConnectionButton from '~/components/WalletConnectionButton';
import WalletInformation from './WalletInformation';
import { Popover, Button as TrayButton, withToolbarStylesIcon } from './adapters';

const StyledSection = styled.section`
  margin: 1rem 0;

  :last-child {
    margin-bottom: 0;
  }
`;

const StyledSectionTitle = styled(Typography.Title)`
  && {
    color: ${props => props.theme.color.text.default};
    font-size: 0.875rem;
    line-height: 0.875rem;
    font-weight: 400;
    margin-bottom: 1rem;
  }
`;

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
      <Link to={r.TRANSLATOR_SETTINGS}>
        <Button fullWidth onClick={onClick}>
          Update your language skills
        </Button>
      </Link>
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
  border-top-color: ${props => props.theme.color.background.light};
`;

const StyledSettingsIcon = withToolbarStylesIcon(SettingsIcon);

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
              <WalletConnectionButton variant="outlined" size="small" />
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
          {!error ? <WalletInformation /> : <Alert type="error" message={getErrorMessage(error)} />}
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
        <StyledSettingsIcon />
      </TrayButton>
    </StyledPopover>
  );
}

export default Settings;
