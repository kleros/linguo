import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';
import clsx from 'clsx';
import { Row, Col, Progress } from 'antd';
import { DislikeOutlined, LikeOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { percentage, greaterThanOrEqual } from '~/adapters/big-number';
import { Alert } from '~/adapters/antd';
import { AppealSide } from '~/features/disputes';
import { TaskParty } from '~/features/tasks';
import Button from '~/shared/Button';
import Deadline from '~/shared/Deadline';
import Spacer from '~/shared/Spacer';
import FormattedNumber from '~/shared/FormattedNumber';
import { useRemainingTime } from '~/shared/RemainingTime';
import EthValue from '~/shared/EthValue';
import EthFiatValue from '~/features/tokens/EthFiatValue';
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
    <BoxParagraph>
      In order to appeal the decision, you need to complete the crowdfunding deposit. The case will only be sent to the
      jurors when the full deposit of both sides is reached.
    </BoxParagraph>
  ) : (
    <BoxParagraph>One or more parties failed to pay the full appeal fee within the deadline.</BoxParagraph>
  );

  const colProps = {
    winner: { xs: 24, sm: 24, md: 24, lg: 12, xl: 12 },
    loser: { xs: 24, sm: 24, md: 24, lg: 12, xl: 12 },
  };

  return (
    <BoxWrapper variant="filled">
      <BoxTitle>{title}</BoxTitle>
      {description}
      <Spacer size={3} />
      <Alert
        showIcon
        type="info"
        message="Contributors can fund the appeal and win rewards"
        description="Note that help funding the dispute can make you win rewards if the side you contributed won."
      />
      <Spacer size={2} />
      <StyledCardRow gutter={[16, 16]}>
        <Col {...colProps.winner}>{leftSideContext}</Col>
        <Col {...colProps.loser}>{rightSideContent}</Col>
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
  const isFullyFunded = greaterThanOrEqual(paidFees, totalAppealCost);

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
      <StyledSectionTitle>
        {descriptionByParty[party]}
        <StyledTitleCaption>{descriptionByAppealSide[appealSide]}</StyledTitleCaption>
      </StyledSectionTitle>
      <Spacer baseSize="sm" size={2} />
      <StyledFeeStatus>
        {isFullyFunded ? (
          <StyledSectionDescription
            css={`
              color: ${p => p.theme.color.success.light};
            `}
          >
            100% Funded
          </StyledSectionDescription>
        ) : (
          <StyledSectionDescription>
            Required Deposit = <EthValue amount={paidFees} suffixType="short" /> of{' '}
            <EthValue amount={totalAppealCost} suffixType="short" />{' '}
            <StyledDepositFiatValue>
              <EthFiatValue amount={totalAppealCost} render={({ formattedValue }) => `(${formattedValue})`} />
            </StyledDepositFiatValue>
          </StyledSectionDescription>
        )}
        <Spacer baseSize="sm" size={0.25} />
        <MyProgress
          remainingTime={remainingTime}
          totalAppealCost={totalAppealCost}
          finalAppealSide={finalAppealSide}
          isOngoing={isOngoing}
          paidFees={paidFees}
        />
      </StyledFeeStatus>
      {isOngoing ? (
        <>
          <StyledOptionalContent className={clsx({ hidden: isFullyFunded || !isOngoing })}>
            <Spacer baseSize="sm" size={0.25} />
            <Deadline
              seconds={remainingTime}
              render={({ formattedValue, icon, endingSoon }) => (
                <StyledDeadlineContent gutter={8} className={endingSoon ? 'ending-soon' : ''}>
                  <Col>{icon}</Col>
                  <Col>
                    <StyledSectionTitle>{formattedValue}</StyledSectionTitle>
                  </Col>
                </StyledDeadlineContent>
              )}
            />
          </StyledOptionalContent>
          <Spacer baseSize="sm" size={2} />
          <Alert
            showIcon
            type="info"
            message="For contributors"
            description={
              <FormattedNumber
                value={reward}
                style="percent"
                render={({ formattedValue }) => (
                  <>
                    If this side wins, you can receive back your contribution + a{' '}
                    <strong>
                      {formattedValue} reward
                      <sup>*</sup>
                    </strong>
                  </>
                )}
              />
            }
          />
        </>
      ) : (
        <>
          <Spacer baseSize="sm" size={2} />
          <StyledResultBox finalAppealSide={finalAppealSide}>{resultTextByAppealSide[finalAppealSide]}</StyledResultBox>
        </>
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

function MyProgress({ remainingTime, finalAppealSide, isOngoing, paidFees, totalAppealCost }) {
  const percent = percentage(paidFees, totalAppealCost) * 100;
  const remainingTimeCountdown = useRemainingTime(remainingTime);

  let status;
  if (percent >= 100) {
    status = 'success';
  } else if (remainingTimeCountdown > 0 && isOngoing) {
    status = 'active';
  } else if (finalAppealSide === AppealSide.Winner) {
    status = 'success';
  } else if (finalAppealSide === AppealSide.Loser) {
    status = 'exception';
  } else {
    status = 'normal';
  }

  return <Progress percent={percent} status={status} showInfo={false} />;
}

MyProgress.propTypes = {
  finalAppealSide: t.oneOf(Object.values(AppealSide)).isRequired,
  paidFees: t.string.isRequired,
  totalAppealCost: t.string.isRequired,
  remainingTime: t.number.isRequired,
  isOngoing: t.bool.isRequired,
};

const descriptionByAppealSide = {
  [AppealSide.Tie]: 'Previous Round was a Tie',
  [AppealSide.Winner]: 'Previous Round Winner',
  [AppealSide.Loser]: 'Previous Round Loser',
};

const descriptionByParty = {
  [TaskParty.Translator]: 'Approve the Translation',
  [TaskParty.Challenger]: 'Reject the Translation',
};

const StyledCardRow = styled(Row)`
  align-items: stretch;
`;

const StyledCard = styled.div`
  background: ${p => p.theme.color.background.light};
  border-radius: 3px;
  border: 1px solid ${p => p.theme.color.border.default};
  box-shadow: 0 2px 3px ${p => p.theme.color.shadow.default};
  padding: 1.5rem;
  height: 100%;
  font-size: ${p => p.theme.fontSize.sm};
  font-weight: ${p => p.theme.fontWeight.regular};
`;

const StyledSectionTitle = styled.h4`
  color: ${p => p.theme.color.text.default};
  font-weight: ${p => p.theme.fontWeight.semibold};
  margin-bottom: 0;
  color: inherit;
`;

const StyledTitleCaption = styled.span`
  display: block;
  font-weight: ${p => p.theme.fontWeight.regular};
  font-size: ${p => p.theme.fontSize.xs};
  color: inherit;
`;

const StyledFeeStatus = styled.div`
  text-align: center;
`;

const StyledOptionalContent = styled.div`
  &.hidden {
    visibility: hidden;
  }
`;

const StyledSectionDescription = styled.p`
  font-size: ${p => p.theme.fontSize.sm};
  margin-bottom: 0;
  color: inherit;
`;

const StyledDepositFiatValue = styled.span`
  display: inline;
  align-items: center;
  gap: 0.25rem;
  color: ${p => p.theme.color.text.light};
  font-weight: ${p => p.theme.fontWeight.regular};
  font-size: ${p => p.theme.fontSize.xs};
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

const StyledDeadlineContent = styled(Row)`
  font-size: ${p => p.theme.fontSize.sm};

  &.ending-soon {
    color: ${p => p.theme.color.danger.default};
  }
`;

const StyledFootnote = styled.p`
  margin-bottom: 0;
  font-size: ${p => p.theme.fontSize.sm};
  color: ${p => p.theme.color.text.light};
`;
