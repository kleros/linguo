import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';
import { Row, Col, Progress } from 'antd';
import { Dispute, AppealSide, TaskParty } from '~/app/linguo';
import { percentage, greaterThanOrEqual } from '~/adapters/bigNumber';
import { InfoIcon, WarningIcon, DisputeIcon } from '~/components/icons';
import Button from '~/components/Button';
import { useRemainingTime } from '~/components/RemainingTime';
import Deadline from '~/components/Deadline';
import Spacer from '~/components/Spacer';
import FormattedNumber from '~/components/FormattedNumber';
import EthValue from '~/components/EthValue';
import BoxWrapper from '../../../components/BoxWrapper';
import BoxTitle from '../../../components/BoxTitle';
import BoxParagraph from '../../../components/BoxParagraph';
import DisputeContext from '../DisputeContext';

function AppealProcess() {
  const dispute = React.useContext(DisputeContext);

  const currentDate = new Date();

  const remainingTimeForTranslator = useRemainingTime(
    Dispute.remainingTimeForAppeal(dispute, {
      currentDate,
      party: TaskParty.Translator,
    })
  );
  const remainingTimeForChallenger = useRemainingTime(
    Dispute.remainingTimeForAppeal(dispute, {
      currentDate,
      party: TaskParty.Challenger,
    })
  );

  const appealIsOngoing = Dispute.isAppealOngoing(dispute, {
    remainingTime: {
      [TaskParty.Translator]: remainingTimeForTranslator,
      [TaskParty.Challenger]: remainingTimeForChallenger,
    },
  });

  const dataByParty = {
    [TaskParty.Translator]: {
      remainingTime: remainingTimeForTranslator,
      appealSide: AppealSide.fromRulingAndParty({
        ruling: dispute.ruling,
        party: TaskParty.Translator,
      }),
      finalAppealSide: AppealSide.fromRulingAndParty({
        ruling: Dispute.expectedFinalRuling(dispute, { appealIsOngoing }),
        party: TaskParty.Translator,
      }),
      paidFees: Dispute.paidFees(dispute, { party: TaskParty.Translator }),
      hasPaidFee: Dispute.hasPaidAppealFee(dispute, { party: TaskParty.Translator }),
      totalAppealCost: Dispute.totalAppealCost(dispute, { party: TaskParty.Challenger }),
      reward: Dispute.fundingROI(dispute, { party: TaskParty.Translator }),
    },
    [TaskParty.Challenger]: {
      remainingTime: remainingTimeForChallenger,
      appealSide: AppealSide.fromRulingAndParty({
        ruling: dispute.ruling,
        party: TaskParty.Challenger,
      }),
      finalAppealSide: AppealSide.fromRulingAndParty({
        ruling: Dispute.expectedFinalRuling(dispute, { appealIsOngoing }),
        party: TaskParty.Challenger,
      }),
      paidFees: Dispute.paidFees(dispute, { party: TaskParty.Challenger }),
      hasPaidFee: Dispute.hasPaidAppealFee(dispute, { party: TaskParty.Challenger }),
      totalAppealCost: Dispute.totalAppealCost(dispute, { party: TaskParty.Challenger }),
      reward: Dispute.fundingROI(dispute, { party: TaskParty.Challenger }),
    },
  };

  const translatorFundingProps = {
    ...dataByParty[TaskParty.Translator],
    party: TaskParty.Translator,
  };

  const challengerFundingProps = {
    ...dataByParty[TaskParty.Challenger],
    party: TaskParty.Challenger,
  };

  const leftSideContext = <AppealFundingSummary appealIsOngoing={appealIsOngoing} {...translatorFundingProps} />;
  const rightSideContent = <AppealFundingSummary appealIsOngoing={appealIsOngoing} {...challengerFundingProps} />;

  return (
    <AppealProcessLayout
      leftSideContext={leftSideContext}
      rightSideContent={rightSideContent}
      appealIsOngoing={appealIsOngoing}
    />
  );
}

export default AppealProcess;

function AppealProcessLayout({ leftSideContext, rightSideContent, appealIsOngoing }) {
  const title = appealIsOngoing ? 'Appeal the decision' : 'The appeal cannot be issued';
  const description = appealIsOngoing ? (
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
      <BoxParagraph>An appeal will not be issued this time.</BoxParagraph>
      <BoxParagraph>
        This can happen if one or more parties failed to pay the full appeal fee within the deadline.
      </BoxParagraph>
    </>
  );
  return (
    <BoxWrapper variant="filled">
      <BoxTitle>{title}</BoxTitle>
      {description}
      <Spacer size={2} />
      <Row
        gutter={[16, 16]}
        css={`
          align-items: stretch;
        `}
      >
        <Col xs={24} sm={24} md={12} lg={12} xl={9}>
          {leftSideContext}
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={9}>
          {rightSideContent}
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={6}>
          <StyledCard>
            <StyledDisclaimer>
              <StyledWarningIcon /> If the loser complete its appeal funding, the winner of the previous round should
              also fully fund the appeal, in order not to lose the case.
            </StyledDisclaimer>
          </StyledCard>
        </Col>
      </Row>
      {appealIsOngoing && (
        <>
          <Spacer baseSize="sm" size={0.25} />
          <StyledFootnote>
            <sup>*</sup> The maximum % of reward. If the other side is not fully funded, the reward will be smaller.
          </StyledFootnote>
        </>
      )}
      <Spacer />
      <Row justify="end">
        <Button disabled={!appealIsOngoing}>Fund the Appeal</Button>
      </Row>
    </BoxWrapper>
  );
}

AppealProcessLayout.propTypes = {
  leftSideContext: t.node.isRequired,
  rightSideContent: t.node.isRequired,
  appealIsOngoing: t.bool.isRequired,
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

function AppealFundingSummary({
  party,
  appealSide,
  finalAppealSide,
  paidFees,
  totalAppealCost,
  reward,
  remainingTime,
  appealIsOngoing,
}) {
  const percent = percentage(paidFees, totalAppealCost) * 100;

  const isRewardBoxHidden = greaterThanOrEqual(paidFees, totalAppealCost);

  let status;
  if (percent >= 100) {
    status = 'success';
  } else if (remainingTime > 0 && appealIsOngoing) {
    status = 'active';
  } else if (finalAppealSide === AppealSide.Winner) {
    status = 'success';
  } else if (finalAppealSide === AppealSide.Loser) {
    status = 'exception';
  } else {
    status = 'normal';
  }

  const resultTextByAppealSide = {
    [AppealSide.Winner]:
      'This side won the dispute. If you contributed, you will soon receive your contribution back + the reward.',
    [AppealSide.Loser]:
      'This side lost the dispute. If you contributed, your share will be used to reward the other party contributors.',
    [AppealSide.Tie]: 'This dispute has no winner. Anyone who contributed will receive the respective share back.',
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
            <StyledSectionDescription>
              Total Deposit Required ={' '}
              <strong>
                {formattedValue} {suffix}
              </strong>
            </StyledSectionDescription>
          )}
        />
        <Progress percent={percent} status={status} showInfo={false} />
      </StyledFeeStatus>
      <Spacer baseSize="sm" size={2} />
      {appealIsOngoing ? (
        <>
          <StyledRewardBox data-hidden={isRewardBoxHidden}>
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
          <StyledDeadline
            seconds={remainingTime}
            render={({ formattedValue, icon, endingSoon }) => (
              <Row
                gutter={8}
                css={`
                  color: ${endingSoon ? p => p.theme.color.danger.default : 'inherit'};
                `}
              >
                <Col>{icon}</Col>
                <Col>
                  <StyledSectionTitle>
                    <StyledTitleCaption>{deadlineDescriptionByAppealSide[appealSide]}</StyledTitleCaption>
                    {formattedValue}
                  </StyledSectionTitle>
                </Col>
              </Row>
            )}
          />
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
  appealIsOngoing: t.bool.isRequired,
};

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

const StyledRewardBox = styled.div`
  border-radius: 0.75rem;
  background: ${p => p.theme.color.background.neutral};
  padding: 1rem;
  text-align: center;
  ${p => (p['data-hidden'] ? 'visibility: hidden;' : undefined)}
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

const StyledResultBox = styled(StyledRewardBox)`
  color: ${p => colorsByAppealSide[p.finalAppealSide] ?? p.theme.color.text.default};
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

const StyledDeadline = styled(Deadline)`
  font-size: ${p => p.theme.fontSize.sm};
`;

const StyledFootnote = styled.p`
  margin-bottom: 0;
  font-size: ${p => p.theme.fontSize.sm};
`;
