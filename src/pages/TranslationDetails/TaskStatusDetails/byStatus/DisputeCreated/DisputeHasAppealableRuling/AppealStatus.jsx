import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';
import { Row, Col, Progress } from 'antd';
import { DislikeOutlined, LikeOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { percentage, greaterThanOrEqual, subtract } from '~/adapters/big-number';
import { Alert } from '~/adapters/antd';

import { TaskParty } from '~/features/tasks';
import EthFiatValue from '~/features/tokens/EthFiatValue';

import Deadline from '~/shared/Deadline';
import Spacer from '~/shared/Spacer';
import FormattedNumber from '~/shared/FormattedNumber';
import EthValue from '~/shared/EthValue';
import CollapsibleSection from '~/shared/CollapsibleSection';

import BoxTitle from '../../../components/BoxTitle';
import BoxParagraph from '../../../components/BoxParagraph';
import AppealContributionForm from './AppealContributionForm';

import { useTask } from '~/hooks/useTask';
import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useDispute } from '~/hooks/useDispute';
import { useRemainingTime } from '~/hooks/useRemainingTime';
import AppealSide, { mapRulingAndPartyToAppealSide } from '~/consts/appealSide';

export default function AppealStatus() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const { disputeID, latestRoundId, currentParty } = task;
  const { dispute } = useDispute(disputeID, latestRoundId);
  const {
    amountPaidChallenger,
    amountPaidTranslator,
    expectedFinalRuling,
    fundingROI,
    hasPaidChallenger,
    hasPaidTranslator,
    isAppealOngoing,
    remainingTimeForChallenger,
    remainingTimeForTranslator,
    totalAppealCost,
  } = dispute;

  const parties = {
    [TaskParty.Translator]: {
      remainingTime: remainingTimeForTranslator,
      appealSide: mapRulingAndPartyToAppealSide(dispute.ruling, TaskParty.Translator),
      finalAppealSide: mapRulingAndPartyToAppealSide(expectedFinalRuling, TaskParty.Translator),
      paidFees: amountPaidTranslator,
      hasPaidFee: hasPaidTranslator,
      totalAppealCost: totalAppealCost(TaskParty.Translator),
      reward: fundingROI(TaskParty.Translator),
    },
    [TaskParty.Challenger]: {
      remainingTime: remainingTimeForChallenger,
      appealSide: mapRulingAndPartyToAppealSide(dispute.ruling, TaskParty.Challenger),
      finalAppealSide: mapRulingAndPartyToAppealSide(expectedFinalRuling, TaskParty.Challenger),
      paidFees: amountPaidChallenger,
      hasPaidFee: hasPaidChallenger,
      totalAppealCost: totalAppealCost(TaskParty.Challenger),
      reward: fundingROI(TaskParty.Challenger),
    },
  };

  const translatorFundingProps = {
    ...parties[TaskParty.Translator],
    party: TaskParty.Translator,
  };

  const challengerFundingProps = {
    ...parties[TaskParty.Challenger],
    party: TaskParty.Challenger,
  };

  const leftSideContent = (
    <AppealFundingSummary
      isOngoing={isAppealOngoing}
      showContributionForm={currentParty !== TaskParty.Challenger}
      {...translatorFundingProps}
    />
  );
  const rightSideContent = (
    <AppealFundingSummary
      isOngoing={isAppealOngoing}
      showContributionForm={currentParty !== TaskParty.Translator}
      {...challengerFundingProps}
    />
  );

  return (
    <CollapsibleSection lazy title="Appeal" titleLevel={3} tabIndex={90}>
      <AppealStatusLayout
        leftSideContent={leftSideContent}
        rightSideContent={rightSideContent}
        isOngoing={isAppealOngoing}
      />
    </CollapsibleSection>
  );
}

function AppealStatusLayout({ leftSideContent, rightSideContent, isOngoing }) {
  const title = isOngoing ? 'Appeal the decision' : 'An appeal could not be issued';
  const description = isOngoing ? (
    <BoxParagraph>
      In order to appeal the decision, you need to pay the appeal deposit. The dispute will be sent to the jurors when
      the full deposit is reached. Note that if the previous round loser funds their side, the previous round winner
      should also fully fund their side in order not to lose the case.
    </BoxParagraph>
  ) : (
    <BoxParagraph>One or more parties failed to pay the full appeal fee within the deadline.</BoxParagraph>
  );

  const colProps = { xs: 24, sm: 24, md: 24, lg: 12, xl: 12 };

  return (
    <StyledContent>
      <BoxTitle>{title}</BoxTitle>
      {description}
      <Spacer size={2} />
      <StyledCardRow gutter={[16, 16]}>
        <Col {...colProps}>{leftSideContent}</Col>
        <Col {...colProps}>{rightSideContent}</Col>
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
    </StyledContent>
  );
}

AppealStatusLayout.propTypes = {
  leftSideContent: t.node.isRequired,
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
  showContributionForm,
}) {
  const isFullyFunded = greaterThanOrEqual(paidFees, totalAppealCost);
  const remainingDeposit = subtract(totalAppealCost, paidFees);

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
            Required Deposit = <EthValue amount={remainingDeposit} suffixType="short" /> of{' '}
            <EthValue amount={totalAppealCost} suffixType="short" />{' '}
            <StyledDepositFiatValue>
              <EthFiatValue amount={totalAppealCost} render={({ formattedValue }) => `(${formattedValue})`} />
            </StyledDepositFiatValue>
          </StyledSectionDescription>
        )}
        <Spacer baseSize="sm" size={0.25} />
        <FundingProgress
          remainingTime={remainingTime}
          totalAppealCost={totalAppealCost}
          finalAppealSide={finalAppealSide}
          isOngoing={isOngoing}
          paidFees={paidFees}
        />
      </StyledFeeStatus>
      {isOngoing ? (
        <>
          {isFullyFunded ? (
            <Spacer />
          ) : (
            <>
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
              <Spacer />
              {showContributionForm ? (
                <AppealContributionForm paidFees={paidFees} totalAppealCost={totalAppealCost} party={party} />
              ) : null}
            </>
          )}
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
  showContributionForm: t.bool.isRequired,
};

function FundingProgress({ remainingTime, finalAppealSide, isOngoing, paidFees, totalAppealCost }) {
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

FundingProgress.propTypes = {
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

const StyledContent = styled.article`
  padding: 2rem;

  @media (max-width: 767.98px) {
    padding: 2rem 0;
  }
`;

const StyledCardRow = styled(Row)`
  align-items: stretch;
`;

const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: ${p => p.theme.color.background.light};
  border-radius: 3px;
  border: 1px solid ${p => p.theme.color.border.default};
  box-shadow: 0 2px 3px ${p => p.theme.color.shadow.default};
  padding: 1.5rem;
  height: 100%;
  font-size: ${p => p.theme.fontSize.sm};
  font-weight: ${p => p.theme.fontWeight.regular};

  > :last-child {
    margin-top: auto;
  }
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
  font-size: ${p => p.theme.fontSize.xs};
  color: ${p => p.theme.color.text.lighter};
`;
