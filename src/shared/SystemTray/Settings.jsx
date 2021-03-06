import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Typography, Divider } from 'antd';
import { selectHasError } from '~/features/web3/web3Slice';
import * as r from '~/app/routes';
import { SettingsIcon } from '~/shared/icons';
import Button from '~/shared/Button';
import WalletConnectionButton from '~/features/web3/WalletConnectionButton';
import WalletInformation from './WalletInformation';
import { Popover, Button as TrayButton, withToolbarStylesIcon } from './adapters';

function Settings() {
  const hasError = useSelector(selectHasError);

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
          {!hasError && <WalletInformation />}
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
    font-weight: ${p => p.theme.fontWeight.regular};
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
            font-weight: ${p => p.theme.fontWeight.semibold};
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
