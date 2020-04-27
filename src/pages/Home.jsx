import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Layout, Typography, Row, Col } from 'antd';
import Button from '~/components/Button';
import LinguoAvatar from '~/assets/images/avatar-linguo-bot.svg';
import WorkAsATranslatorAvatar from '~/assets/images/avatar-work-as-a-translator.svg';
import RequestTranslationAvatar from '~/assets/images/avatar-request-translation.svg';
import * as r from '~/app/routes';

const StyledLayout = styled(Layout)`
  margin: 4rem;
  padding: 1rem 4rem 4rem;
  max-width: 68rem;
  background-color: ${props => props.theme.color.background.light};
  box-shadow: 0 0.375rem 5.625rem ${props => props.theme.color.shadow.default};
  border-radius: 0.75rem;

  @media (max-width: 575.98px) {
    margin: 0;
    box-shadow: none;
    border-radius: 0;
  }
`;

const StyledPageHeader = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  margin-bottom: 4rem;
  ::before {
    content: '';
    display: block;
    width: 100%;
    border-bottom: 1px solid ${props => props.theme.color.secondary.default};
    position: absolute;
    z-index: 0;
    top: 5.25rem;
  }
`;

const StyledLinguoAvatar = styled(LinguoAvatar)`
  width: 9.25rem;
  height: 9.25rem;
  position: relative;
  z-index: 1;
`;

const StyledLayoutContent = styled(Layout.Content)``;

const StyledRow = styled(Row)`
  align-items: stretch;
`;

const StyledTitle = styled(Typography.Title)`
  && {
    color: ${props => props.theme.color.secondary.default};
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: 500;
    text-align: center;
    margin-bottom: 2rem;
  }
`;

const StyledButton = styled(Button)`
  && {
    border: 0.625rem solid ${props => props.theme.color.border.default};
    border-radius: 1.325rem;
    font-size: ${props => props.theme.fontSize.xl};
    padding: 1rem;

    ::after,
    ::before {
      border-radius: 0;
    }

    :hover,
    :active,
    :focus {
      border: 0.625rem solid ${props => props.theme.color.border.default};
    }

    > span {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;

      svg {
        width: 8rem;
        margin-bottom: 1rem;
      }

      .text {
        margin-bottom: 1rem;
        padding: 0 2rem;
        word-break: normal;
        white-space: normal;
        max-width: 12rem;
      }
    }
  }
`;

export default function Home() {
  return (
    <StyledLayout>
      <StyledPageHeader>
        <StyledLinguoAvatar />
      </StyledPageHeader>
      <StyledLayoutContent>
        <StyledTitle>Welcome!</StyledTitle>
        <StyledRow gutter={[8, 16]}>
          <Col xl={{ span: 10, offset: 2 }} lg={{ span: 11, offset: 1 }} md={{ span: 12, offset: 0 }} xs={24}>
            <Link to={r.TRANSLATION_DASHBOARD}>
              <StyledButton fullWidth>
                <RequestTranslationAvatar />
                <span className="text">Request a Translation</span>
              </StyledButton>
            </Link>
          </Col>
          <Col xl={10} lg={11} md={12} xs={24}>
            <Link to={r.TRANSLATOR_DASHBOARD}>
              <StyledButton fullWidth>
                <WorkAsATranslatorAvatar />
                <span className="text">Work as a Translator</span>
              </StyledButton>
            </Link>
          </Col>
        </StyledRow>
      </StyledLayoutContent>
    </StyledLayout>
  );
}
