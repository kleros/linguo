import React from 'react';
import { Titled } from 'react-titled';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Col, Layout, Row, Switch, Typography } from 'antd';
import styled from 'styled-components';
import * as r from '~/app/routes';
import LinguoAvatar from '~/assets/images/avatar-linguo-bot.svg';
import RequestTranslationAvatar from '~/assets/images/avatar-request-translation.svg';
import ReviewTranslationsAvatar from '~/assets/images/avatar-task-awaiting-review.svg';
import WorkAsATranslatorAvatar from '~/assets/images/avatar-work-as-a-translator.svg';
import { selectPreference, setPreference } from '~/features/ui/uiSlice';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';

export default function Home() {
  const dispatch = useDispatch();
  const defaultPage = useSelector(selectPreference('page.default'));

  const createClickHandler = page => checked => {
    const value = checked ? page : null;

    dispatch(
      setPreference({
        key: 'page.default',
        value,
      })
    );
  };

  return (
    <Titled title={() => 'Linguo by Kleros'}>
      <StyledLayout>
        <StyledPageHeader>
          <StyledLinguoAvatar />
        </StyledPageHeader>
        <Spacer />
        <StyledLayoutContent>
          <StyledTitle>Welcome!</StyledTitle>
          <Spacer size={3} />
          <StyledRow gutter={[16, 16]}>
            <Col xl={8} lg={{ span: 8, offset: 0 }} md={{ span: 12, offset: 0 }} sm={{ span: 18, offset: 3 }} xs={24}>
              <Link to={r.REQUESTER_DASHBOARD}>
                <StyledButton fullWidth>
                  <RequestTranslationAvatar />
                  <span className="text">My Translations</span>
                </StyledButton>
              </Link>
              <Spacer />
              <StyledSwitchWrapper>
                <Switch
                  size="small"
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  checked={defaultPage === r.REQUESTER_DASHBOARD}
                  onClick={createClickHandler(r.REQUESTER_DASHBOARD)}
                />
                Set as default page for Linguo
              </StyledSwitchWrapper>
            </Col>
            <Col xl={8} lg={{ span: 8, offset: 0 }} md={{ span: 12, offset: 0 }} sm={{ span: 18, offset: 3 }} xs={24}>
              <Link to={`${r.TRANSLATOR_DASHBOARD}?status=open`}>
                <StyledButton fullWidth>
                  <WorkAsATranslatorAvatar />
                  <span className="text">Work as a Translator</span>
                </StyledButton>
              </Link>
              <Spacer />
              <StyledSwitchWrapper>
                <Switch
                  size="small"
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  checked={defaultPage === `${r.TRANSLATOR_DASHBOARD}?status=open`}
                  onClick={createClickHandler(`${r.TRANSLATOR_DASHBOARD}?status=open`)}
                />
                Set as default page for Linguo
              </StyledSwitchWrapper>
            </Col>
            <Col xl={8} lg={{ span: 8, offset: 0 }} md={{ span: 12, offset: 6 }} sm={{ span: 18, offset: 3 }} xs={24}>
              <Link to={`${r.TRANSLATOR_DASHBOARD}?status=inReview&allTasks=true`}>
                <StyledButton fullWidth>
                  <ReviewTranslationsAvatar />
                  <span className="text">Review Translations</span>
                </StyledButton>
              </Link>
              <Spacer />
              <StyledSwitchWrapper>
                <Switch
                  size="small"
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  checked={defaultPage === `${r.TRANSLATOR_DASHBOARD}?status=inReview&allTasks=true`}
                  onClick={createClickHandler(`${r.TRANSLATOR_DASHBOARD}?status=inReview&allTasks=true`)}
                />
                Set as default page for Linguo
              </StyledSwitchWrapper>
            </Col>
          </StyledRow>
        </StyledLayoutContent>
      </StyledLayout>
    </Titled>
  );
}

const StyledLayout = styled(Layout)`
  margin: 4rem;
  padding: 1rem 4rem 4rem;
  max-width: 68rem;
  background-color: ${props => props.theme.color.background.light};
  box-shadow: 0 2px 3px ${props => props.theme.color.shadow.default};
  border-radius: 3px;
  align-self: stretch;

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
    font-weight: ${p => p.theme.fontWeight.semibold};
    text-align: center;
  }
`;

const StyledButton = styled(Button)`
  && {
    border: 0.3125rem solid ${props => props.theme.color.border.default};
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
      border: 0.3125rem solid ${props => props.theme.color.border.default};
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
        word-break: normal;
        white-space: normal;
      }
    }
  }
`;

const StyledSwitchWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  color: ${p => p.theme.color.text.light};
  font-size: ${p => p.theme.fontSize.sm};
  font-weight: ${p => p.theme.fontWeight.regular};

  .ant-switch-inner > .anticon {
    display: none;
  }
`;
