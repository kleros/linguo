import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Typography, Row, Col, Tooltip } from 'antd';
import * as r from '~/app/routes';
import { Task } from '~/api/linguo';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import Button from '~/components/Button';
import Card from '~/components/Card';
import RemainingTime from '~/components/RemainingTime';
import EthValue from '~/components/EthValue';
import TaskCardTitle from './TaskCardTitle';
import TaskInfoGrid from './TaskInfoGrid';

const StyledTaskDeadline = styled.div`
  text-align: center;
  font-weight: 700;
  line-height: 1.33;

  &.ending-soon {
    color: ${props => props.theme.danger.default};
  }

  .title {
    font-size: ${props => props.theme.fontSize.sm};
    margin-bottom: -0.25rem;
  }

  .value {
    font-size: ${props => props.theme.fontSize.lg};
  }
`;

function TaskDeadline({ formattedValue, endingSoon, className }) {
  return (
    <StyledTaskDeadline className={clsx({ 'ending-soon': endingSoon }, className)}>
      <div className="title">Deadline</div>
      <div className="value">{formattedValue}</div>
    </StyledTaskDeadline>
  );
}

TaskDeadline.propTypes = {
  formattedValue: t.node.isRequired,
  endingSoon: t.bool,
  className: t.string,
};

TaskDeadline.defaultProps = {
  endingSoon: false,
  className: '',
};

const StyledCard = styled(Card)`
  height: 100%;
`;

const StyledTaskTitle = styled(Typography.Title)`
  && {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${props => props.theme.text.light};
    font-size: ${props => props.theme.fontSize.md};
    font-weight: 500;
    margin-bottom: 1rem;
  }
`;

function PriceDisplay({ amount, formattedValue, suffix }) {
  return (
    <Tooltip title={<EthValue amount={amount} unit="ether" decimals={18} suffixType="short" />}>
      <span
        css={`
          cursor: help;
        `}
      >
        {`${formattedValue} ${suffix}`.trim()}
      </span>
    </Tooltip>
  );
}

PriceDisplay.propTypes = {
  amount: t.any.isRequired,
  value: t.any.isRequired,
  formattedValue: t.number.isRequired,
  suffix: t.string,
};

PriceDisplay.defaultProps = {
  suffix: '',
};

const nf = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 0,
  useGrouping: true,
});

const getTaskDetailsRoute = r.withParamSubtitution(r.TRANSLATION_TASK_DETAILS);

function TaskCard({
  ID,
  title,
  status,
  sourceLanguage,
  targetLanguage,
  lastInteraction,
  submissionTimeout,
  wordCount,
  currentPrice,
  currentPricePerWord,
  expectedQuality,
}) {
  const remainingTimeForSubmission = Task.remainingTimeForSubmission({
    status,
    lastInteraction,
    submissionTimeout,
  });

  const { name = '', requiredLevel = '' } = translationQualityTiers[expectedQuality] || {};
  const taskInfo = [
    {
      title: 'Price per word',
      content: <EthValue amount={currentPricePerWord} suffixType="short" render={PriceDisplay} />,
    },
    {
      title: 'Number of words',
      content: nf.format(wordCount),
    },
    {
      title: 'Total Price',
      content: <EthValue amount={currentPrice} suffixType="short" render={PriceDisplay} />,
    },
    {
      title: name,
      content: requiredLevel,
    },
  ];

  return (
    <StyledCard
      title={<TaskCardTitle sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} />}
      titleLevel={2}
      footer={
        <Row gutter={30} align="middle">
          <Col span={12}>
            <RemainingTime initialValueSeconds={remainingTimeForSubmission} render={TaskDeadline} />
          </Col>
          <Col span={12}>
            <Link to={getTaskDetailsRoute({ id: ID })}>
              <Button fullWidth variant="filled" color="primary">
                See details
              </Button>
            </Link>
          </Col>
        </Row>
      }
    >
      <Tooltip title={title} placement="top" mouseEnterDelay={0.5} arrowPointAtCenter>
        {/* The wrapping div fixes an issue with styled compnents not
            properly performing ref forwarding for function components. */}
        <div
          css={`
            cursor: help;
          `}
        >
          <StyledTaskTitle level={3}>{title}</StyledTaskTitle>
        </div>
      </Tooltip>
      <TaskInfoGrid data={taskInfo} />
    </StyledCard>
  );
}

TaskCard.propTypes = {
  ID: t.number.isRequired,
  title: t.string.isRequired,
  status: t.number.isRequired,
  sourceLanguage: t.string.isRequired,
  targetLanguage: t.string.isRequired,
  lastInteraction: t.any.isRequired,
  submissionTimeout: t.number.isRequired,
  wordCount: t.number.isRequired,
  currentPrice: t.any.isRequired,
  currentPricePerWord: t.any.isRequired,
  expectedQuality: t.string.isRequired,
};

TaskCard.defaultProps = {};

export default TaskCard;
