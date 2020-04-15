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
import FormattedNumber from '~/components/FormattedNumber';
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

function TaskDeadline({ className, ...task }) {
  let currentTimeout;
  const currentDate = new Date();

  if ([TaskStatus.Created, TaskStatus.Assigned].includes(task.status)) {
    currentTimeout = Task.remainingTimeForSubmission(task, { currentDate });
  } else if (TaskStatus.AwaitingReview === task.status) {
    currentTimeout = Task.remainingTimeForReview(task, { currentDate });
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

const getTaskDetailsRoute = r.withParamSubtitution(r.TRANSLATION_TASK_DETAILS);

const _1_MINUTE_IN_MILISECONDS = 60 * 1000;

function TaskCard(task) {
  const {
    ID,
    status,
    title,
    maxPrice,
    assignedPrice,
    sourceLanguage,
    targetLanguage,
    wordCount,
    expectedQuality,
  } = task;

  const { currentPrice, currentPricePerWord } = useSelfUpdatingState({
    updateIntervalMs: _1_MINUTE_IN_MILISECONDS,
    getState: () => {
      const currentDate = new Date();
      return {
        currentPrice: Task.currentPrice(task, { currentDate }),
        currentPricePerWord: Task.currentPricePerWord(task, { currentDate }),
      };
    },
    stopWhen: ({ currentPrice }) => !!assignedPrice || currentPrice === maxPrice,
  });

  const { name = '', requiredLevel = '' } = translationQualityTiers[expectedQuality] || {};

  const taskInfo = [
    {
      title: 'Price per word',
      content: <TaskPrice showTooltip value={currentPricePerWord} />,
    },
    {
      title: 'Number of words',
      content: <FormattedNumber value={wordCount} />,
    },
    {
      title: 'Total Price',
      content: <TaskPrice showTooltip showFootnoteMark={status === TaskStatus.Open} value={currentPrice} />,
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
            <TaskDeadline {...task} />
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
  assignedPrice: t.string,
  sourceLanguage: t.string.isRequired,
  targetLanguage: t.string.isRequired,
  lastInteraction: t.any.isRequired,
  submissionTimeout: t.number.isRequired,
  reviewTimeout: t.number.isRequired,
  wordCount: t.number.isRequired,
  expectedQuality: t.string.isRequired,
};

export default TaskCard;
