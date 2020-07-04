import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';
import { Row, Col, Progress } from 'antd';
import { CheckCircleOutlined, DislikeOutlined, LikeOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { AppealSide } from '~/features/disputes';
import { TaskParty } from '~/features/tasks';
import { percentage, greaterThanOrEqual } from '~/adapters/bigNumber';
import { InfoIcon, WarningIcon, DisputeIcon } from '~/shared/icons';
import Button from '~/shared/Button';
import Deadline from '~/shared/Deadline';
import Spacer from '~/shared/Spacer';
import FormattedNumber from '~/shared/FormattedNumber';
import EthValue from '~/shared/EthValue';
import BoxWrapper from '../../../components/BoxWrapper';
import BoxTitle from '../../../components/BoxTitle';
import BoxParagraph from '../../../components/BoxParagraph';
import AppealModalForm from './AppealModalForm';
import useAppealStatus from './useAppealStatus';

export default function AppealStatus() {
  const { parties, isOngoing } = useAppealStatus();

  const translatorFundingProps = {
    ...parties[TaskParty.Translator],
    party: TaskParty.Translator,
  };

  const challengerFundingProps = {
    ...parties[TaskParty.Challenger],
    party: TaskParty.Challenger,
  };

  const leftSideContext = <AppealFundingSummary isOngoing={isOngoing} {...translatorFundingProps} />;
  const rightSideContent = <AppealFundingSummary isOngoing={isOngoing} {...challengerFundingProps} />;

  return (
    <AppealStatusLayout leftSideContext={leftSideContext} rightSideContent={rightSideContent} isOngoing={isOngoing} />
  );
}

function AppealStatusLayout({ leftSideContext, rightSideContent, isOngoing }) {
  const title = isOngoing ? 'Appeal the decision' : 'An appeal could not be issued';
  const description = isOngoing ? (
    <>
      <BoxParagraph>
        In order to appeal the decision, you need to complete the crowdfunding deposit. The case will only be sent to
        the jurors when the full deposit of both sides is reached.
      </BoxParagraph>
      <BoxParagraph>
        <InfoIcon /> Anyone can contribute to appeal crowdfunding. If you help funding the dispute, if the side you
        supported wins, you will receive a reward.
      </BoxParagraph>
    </>
  ) : (
    <>
      <BoxParagraph>One or more parties failed to pay the full appeal fee within the deadline.</BoxParagraph>
    </>
  );

  const colProps = isOngoing
    ? {
        winner: { xs: 24, sm: 24, md: 12, lg: 12, xl: 9 },
        loser: { xs: 24, sm: 24, md: 12, lg: 12, xl: 9 },
        warning: { xs: 24, sm: 24, md: 24, lg: 24, xl: 6 },
      }
    : {
        winner: { xs: 24, sm: 24, md: 12 },
        loser: { xs: 24, sm: 24, md: 12 },
        warning: { span: 0 },
      };

  return (
    <BoxWrapper variant="filled">
      <BoxTitle>{title}</BoxTitle>
      {description}
      <Spacer size={2} />
      <StyledCardRow gutter={[16, 16]}>
        <Col {...colProps.winner}>{leftSideContext}</Col>
        <Col {...colProps.loser}>{rightSideContent}</Col>
        <Col {...colProps.warning}>
          <StyledCard>
            <StyledDisclaimer>
              <StyledWarningIcon /> If the loser complete its appeal funding, the winner of the previous round should
              also fully fund the appeal.{' '}
              <strong>Otherwise, the current winner party will automatically lose the case.</strong>
            </StyledDisclaimer>
          </StyledCard>
        </Col>
      </StyledCardRow>
      {isOngoing && (
        <>
          <Spacer baseSize="sm" size={0.25} />
          <StyledFootnote>
            * The actual reward may vary if the other party is not fully funded or in the unlikely event of a Kleros
            governance vote changing fees or system parameters while this case is ongoing.
          </StyledFootnote>
          <Spacer />
        </>
      )}
      <Spacer />
      <Row justify="end">
        <AppealModalForm forceClose={!isOngoing} trigger={<Button disabled={!isOngoing}>Fund the Appeal</Button>} />
      </Row>
    </BoxWrapper>
  );
}

AppealStatusLayout.propTypes = {
  leftSideContext: t.node.isRequired,
  rightSideContent: t.node.isRequired,
  isOngoing: t.bool.isRequired,
};

function AppealFundingSummary({
  party,
  appealSide,
  finalAppealSide,
  paidFees,
  totalAppealCost,
  reward,
  remainingTime,
  isOngoing,
}) {
  const percent = percentage(paidFees, totalAppealCost) * 100;

  const isFullyFunded = greaterThanOrEqual(paidFees, totalAppealCost);

  let status;
  if (percent >= 100) {
    status = 'success';
  } else if (remainingTime > 0 && isOngoing) {
    status = 'active';
  } else if (finalAppealSide === AppealSide.Winner) {
    status = 'success';
  } else if (finalAppealSide === AppealSide.Loser) {
    status = 'exception';
  } else {
    status = 'normal';
  }

  const resultTextByAppealSide = {
    [AppealSide.Winner]: (
      <StyledResult>
        <h4 className="title">
          <LikeOutlined />
          This side won the dispute.
        </h4>
        <p>If you contributed, you will soon receive your contribution back + the reward.</p>
      </StyledResult>
    ),
    [AppealSide.Loser]: (
      <StyledResult>
        <h4 className="title">
          <DislikeOutlined />
          This side lost the dispute.
        </h4>
        <p>If you contributed, your share will be used to reward the other party contributors.</p>
      </StyledResult>
    ),
    [AppealSide.Tie]: (
      <StyledResult>
        <h4 className="title">
          <MinusCircleOutlined />
          This side lost the dispute.
        </h4>
        <p>This dispute has no winner. Anyone who contributed will receive the respective share back.</p>
      </StyledResult>
    ),
  };

  return (
    <StyledCard>
      <Row gutter={8}>
        <Col>
          <DisputeIcon />
        </Col>
        <Col>
          <StyledSectionTitle>
            <StyledTitleCaption>{descriptionByAppealSide[appealSide]}</StyledTitleCaption>
            {descriptionByParty[party]}
          </StyledSectionTitle>
        </Col>
      </Row>
      <Spacer baseSize="sm" size={2} />
      <StyledFeeStatus>
        <EthValue
          amount={totalAppealCost}
          suffixType="short"
          render={({ formattedValue, suffix }) => (
            <StyledDepositDescription>
              Total Deposit Required ={' '}
              <StyledDepositValue>
                {formattedValue} {suffix}
              </StyledDepositValue>
            </StyledDepositDescription>
          )}
        />
        <Progress percent={percent} status={status} showInfo={false} />
      </StyledFeeStatus>
      <Spacer baseSize="sm" size={2} />
      {isOngoing ? (
        <>
          {isFullyFunded ? (
            <StyledFundingCompleteWrapper>
              <CheckCircleOutlined />
            </StyledFundingCompleteWrapper>
          ) : (
            <StyledRewardBoxWrapper>
              <StyledRewardBox>
                <StyledSectionTitle>For third party contributors</StyledSectionTitle>
                <Spacer baseSize="sm" size={0.25} />
                <StyledSectionDescription>
                  If this side wins, you can receive back your contribution + a reward.
                </StyledSectionDescription>
                <Spacer baseSize="sm" />
                <FormattedNumber
                  value={reward}
                  style="percent"
                  render={({ formattedValue }) => (
                    <StyledRewardDisplay>
                      {formattedValue} Reward<sup>*</sup>
                    </StyledRewardDisplay>
                  )}
                />
              </StyledRewardBox>
              <Spacer baseSize="sm" size={2} />
            </StyledRewardBoxWrapper>
          )}
          {!isFullyFunded && (
            <Deadline
              seconds={remainingTime}
              render={({ formattedValue, icon, endingSoon }) => (
                <StyledDeadlineContent gutter={8} className={endingSoon ? 'ending-soon' : ''}>
                  <Col>{icon}</Col>
                  <Col>
                    <StyledSectionTitle>
                      <StyledTitleCaption>{deadlineDescriptionByAppealSide[appealSide]}</StyledTitleCaption>
                      {formattedValue}
                    </StyledSectionTitle>
                  </Col>
                </StyledDeadlineContent>
              )}
            />
          )}
        </>
      ) : (
        <StyledResultBox finalAppealSide={finalAppealSide}>{resultTextByAppealSide[finalAppealSide]}</StyledResultBox>
      )}
    </StyledCard>
  );
}

AppealFundingSummary.propTypes = {
  party: t.oneOf([TaskParty.Translator, TaskParty.Challenger]).isRequired,
  appealSide: t.oneOf(Object.values(AppealSide)).isRequired,
  finalAppealSide: t.oneOf(Object.values(AppealSide)).isRequired,
  paidFees: t.string.isRequired,
  totalAppealCost: t.string.isRequired,
  reward: t.number.isRequired,
  remainingTime: t.number.isRequired,
  isOngoing: t.bool.isRequired,
};

const descriptionByAppealSide = {
  [AppealSide.Tie]: 'Previous Round was a Tie',
  [AppealSide.Winner]: 'Previous Round Winner',
  [AppealSide.Loser]: 'Previous Round Loser',
};

const descriptionByParty = {
  [TaskParty.Translator]: 'Translator',
  [TaskParty.Challenger]: 'Challenger',
};

const deadlineDescriptionByAppealSide = {
  [AppealSide.Tie]: 'Deadline',
  [AppealSide.Winner]: 'Winner Dealine',
  [AppealSide.Loser]: 'Loser Deadline',
};

const StyledCardRow = styled(Row)`
  align-items: stretch;
`;

const StyledCard = styled.div`
  background: ${p => p.theme.color.background.light};
  border-radius: 0.75rem;
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 0.375rem 2rem ${props => props.theme.color.shadow.default};
  font-size: ${p => p.theme.fontSize.sm};
  font-weight: 400;
`;

const StyledSectionTitle = styled.h4`
  color: ${p => p.theme.color.text.default};
  font-weight: 500;
  margin-bottom: 0;
  color: inherit;
`;

const StyledTitleCaption = styled.span`
  display: block;
  font-weight: 400;
  color: inherit;
`;

const StyledFeeStatus = styled.div``;

const StyledSectionDescription = styled.p`
  text-align: center;
  margin-bottom: 0;
  color: inherit;
`;

const StyledDepositDescription = styled(StyledSectionDescription)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDepositValue = styled.span`
  font-weight: 700;
`;

const StyledFundingCompleteWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${p => p.theme.color.success.default};
  flex: 1;

  > .anticon {
    min-width: 1rem;
    max-width: 2rem;
    width: 100%;

    > svg {
      width: 100%;
      height: 100%;
    }
  }
`;

const StyledRewardBoxWrapper = styled.div`
  ${p => (p.visuallyHidden ? 'visibility: hidden;' : undefined)}

  @media(max-width: 767.98px) {
    ${p => (p.visuallyHidden ? 'display: none;' : undefined)}
  }
`;

const StyledRewardBox = styled.div`
  border-radius: 0.75rem;
  background: ${p => p.theme.color.background.neutral};
  padding: 1rem;
  text-align: center;
`;

const colorsByAppealSide = {
  [AppealSide.Winner]: css`
    ${p => p.theme.color.success.default}
  `,
  [AppealSide.Loser]: css`
    ${p => p.theme.color.danger.light}
  `,
  [AppealSide.Tie]: css`
    ${p => p.theme.color.text.light}
  `,
};

const StyledResultBox = styled.div`
  color: ${p => colorsByAppealSide[p.finalAppealSide] ?? p.theme.color.text.default};
`;

const StyledResult = styled.article`
  .title {
    display: flex;
    gap: 0.5rem;
    color: inherit;
    line-height: 1.33;
  }
`;

const StyledRewardDisplay = styled.div`
  font-size: ${p => p.theme.fontSize.xxl};
  font-weight: 500;
  color: inherit;
`;

const StyledWarningIcon = styled(WarningIcon)``;

const StyledDisclaimer = styled.p`
  color: ${p => p.theme.color.primary.default};
  font-weight: 400;
  margin-bottom: 0;

  @media (min-width: 1200px) {
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    text-align: center;

    ${StyledWarningIcon} {
      display: block;
      width: 2rem;
      height: 2rem;
      margin: 0 auto 1rem;
      svg {
        width: 100%;
        height: 100%;
      }
    }
  }
`;

const StyledDeadlineContent = styled(Row)`
  font-size: ${p => p.theme.fontSize.sm};

  &.ending-soon {
    color: ${p => p.theme.color.danger.default};
  }
`;

const StyledFootnote = styled.p`
  margin-bottom: 0;
  font-size: ${p => p.theme.fontSize.sm};
  font-weight: 400;
  color: ${p => p.theme.color.text.light};
`;
