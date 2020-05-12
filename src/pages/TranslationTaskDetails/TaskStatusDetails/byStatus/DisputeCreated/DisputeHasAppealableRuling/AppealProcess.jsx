import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Progress } from 'antd';
import { AppealSide, TaskParty } from '~/app/linguo';
import { percent } from '~/adapters/bigNumber';
import { InfoIcon, WarningIcon, DisputeIcon } from '~/components/icons';
import Button from '~/components/Button';
import Deadline from '~/components/Deadline';
import Spacer from '~/components/Spacer';
import FormattedNumber from '~/components/FormattedNumber';
import EthValue from '~/components/EthValue';
import BoxWrapper from '../../../components/BoxWrapper';
import BoxTitle from '../../../components/BoxTitle';
import BoxParagraph from '../../../components/BoxParagraph';

function AppealProcess() {
  const leftSideContext = (
    <AppealFundingSummary
      party={TaskParty.Translator}
      appealSide={AppealSide.Loser}
      paidFees="4000000000000"
      totalAppealCost="5000000000000"
      reward={1}
      remainingTime={86399}
    />
  );
  const rightSideContent = (
    <AppealFundingSummary
      party={TaskParty.Challenger}
      appealSide={AppealSide.Winner}
      paidFees="3000000000000"
      totalAppealCost="3000000000000"
      reward={0.33}
      remainingTime={186399}
    />
  );

  return <AppealProcessLayout leftSideContext={leftSideContext} rightSideContent={rightSideContent} />;
}

export default AppealProcess;

function AppealProcessLayout({ leftSideContext, rightSideContent }) {
  return (
    <BoxWrapper variant="filled">
      <BoxTitle>Appeal the decision</BoxTitle>
      <BoxParagraph>
        In order to appeal the decision, you need to complete the crowdfunding deposit. The case will only be sent to
        the jurors when the full deposit of both sides is reached.
      </BoxParagraph>
      <BoxParagraph>
        <InfoIcon /> Anyone can contribute to appeal crowdfunding. If you help funding the dispute, if the side you
        supported wins, you will receive a reward.
      </BoxParagraph>
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
      <Spacer />
      <Row justify="end">
        <Button>Fund the Appeal</Button>
      </Row>
    </BoxWrapper>
  );
}

AppealProcessLayout.propTypes = {
  leftSideContext: t.node,
  rightSideContent: t.node,
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

function AppealFundingSummary({ party, appealSide, paidFees, totalAppealCost, reward, remainingTime }) {
  const percentage = percent(paidFees, totalAppealCost) * 100;
  const status = percentage < 100 ? 'active' : undefined;

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
        <Progress percent={percentage} status={status} showInfo={false} />
      </StyledFeeStatus>
      <Spacer baseSize="sm" size={2} />
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
          render={({ formattedValue }) => <StyledRewardDisplay>{formattedValue} Reward</StyledRewardDisplay>}
        />
      </StyledRewardBox>
      <Spacer baseSize="sm" size={2} />
      <StyledDeadline
        initialValueSeconds={remainingTime}
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
    </StyledCard>
  );
}

AppealFundingSummary.propTypes = {
  party: t.oneOf([TaskParty.Translator, TaskParty.Challenger]).isRequired,
  appealSide: t.oneOf(Object.values(AppealSide)).isRequired,
  paidFees: t.string.isRequired,
  totalAppealCost: t.string.isRequired,
  reward: t.number.isRequired,
  remainingTime: t.number.isRequired,
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
