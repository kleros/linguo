import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Typography, Row, Col, Tooltip } from 'antd';
import * as r from '~/app/routes';
import { Task, TaskStatus } from '~/api/linguo';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import useSelfUpdatingState from '~/hooks/useSelfUpdatingState';
import Button from '~/components/Button';
import Card from '~/components/Card';
import RemainingTime from '~/components/RemainingTime';
import TaskCardTitle from './TaskCardTitle';
import TaskInfoGrid from './TaskInfoGrid';
import TaskPrice from './TaskPrice';

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

function TaskDeadline({ status, lastInteraction, submissionTimeout, reviewTimeout, className }) {
  let currentTimeout;

  if ([TaskStatus.Created, TaskStatus.Assigned].includes(status)) {
    currentTimeout = Task.remainingTimeForSubmission({
      status,
      lastInteraction,
      submissionTimeout,
    });
  } else if (TaskStatus.AwaitingReview === status) {
    currentTimeout = Task.remainingTimeForReview({
      status,
      lastInteraction,
      reviewTimeout,
    });
  }

  return currentTimeout !== undefined ? (
    <RemainingTime
      initialValueSeconds={currentTimeout}
      render={({ formattedValue, endingSoon }) => (
        <StyledTaskDeadline className={clsx({ 'ending-soon': endingSoon }, className)}>
          <div className="title">Deadline</div>
          <div className="value">{formattedValue}</div>
        </StyledTaskDeadline>
      )}
    />
  ) : null;
}

TaskDeadline.propTypes = {
  status: t.number.isRequired,
  lastInteraction: t.instanceOf(Date).isRequired,
  submissionTimeout: t.number.isRequired,
  reviewTimeout: t.number.isRequired,
  className: t.string,
};

TaskDeadline.defaultProps = {
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

const nf = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 0,
  useGrouping: true,
});

const getTaskDetailsRoute = r.withParamSubtitution(r.TRANSLATION_TASK_DETAILS);

const _1_MINUTE_IN_MILISECONDS = 60 * 1000;

function TaskCard({
  ID,
  status,
  title,
  minPrice,
  maxPrice,
  acceptedPrice,
  sourceLanguage,
  targetLanguage,
  lastInteraction,
  submissionTimeout,
  reviewTimeout,
  wordCount,
  expectedQuality,
}) {
  const currentPrice = useSelfUpdatingState({
    updateIntervalMs: _1_MINUTE_IN_MILISECONDS,
    getState: () =>
      acceptedPrice || Task.currentPrice({ status, minPrice, maxPrice, lastInteraction, submissionTimeout }),
    stopWhen: ({ currentPrice }) => !!acceptedPrice || currentPrice === maxPrice,
  });
  const currentPricePerWord = Task.currentPricePerWord({
    currentPrice: currentPrice,
    wordCount,
  });
  const { name = '', requiredLevel = '' } = translationQualityTiers[expectedQuality] || {};

  const taskInfo = [
    {
      title: 'Price per word',
      content: <TaskPrice showTooltip value={currentPricePerWord} />,
    },
    {
      title: 'Number of words',
      content: nf.format(wordCount),
    },
    {
      title: 'Total Price',
      content: <TaskPrice showTooltip showFootnoteMark value={currentPrice} />,
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
            <TaskDeadline
              status={status}
              lastInteraction={lastInteraction}
              submissionTimeout={submissionTimeout}
              reviewTimeout={reviewTimeout}
            />
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
  status: t.number.isRequired,
  title: t.string.isRequired,
  minPrice: t.any.isRequired,
  maxPrice: t.any.isRequired,
  acceptedPrice: t.string,
  sourceLanguage: t.string.isRequired,
  targetLanguage: t.string.isRequired,
  lastInteraction: t.any.isRequired,
  submissionTimeout: t.number.isRequired,
  reviewTimeout: t.number.isRequired,
  wordCount: t.number.isRequired,
  expectedQuality: t.string.isRequired,
};

TaskCard.defaultProps = {
  acceptedPrice: '',
};

export default TaskCard;