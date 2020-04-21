import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Typography, Tooltip } from 'antd';
import { Task, TaskStatus } from '~/api/linguo';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import useSelfUpdatingState from '~/hooks/useSelfUpdatingState';
import Card from '~/components/Card';
import FormattedNumber from '~/components/FormattedNumber';
import TaskCardTitle from './TaskCardTitle';
import TaskCardFooter from './TaskCardFooter';
import TaskInfoGrid from './TaskInfoGrid';
import TaskPrice from './TaskPrice';

const StyledCard = styled(Card)`
  height: 100%;
`;

const StyledTaskTitle = styled(Typography.Title)`
  && {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${props => props.theme.color.text.light};
    font-size: ${props => props.theme.fontSize.md};
    font-weight: 500;
    margin-bottom: 1rem;
  }
`;

const _1_MINUTE_IN_MILISECONDS = 60 * 1000;

function TaskCard(task) {
  const { status, title, maxPrice, assignedPrice, sourceLanguage, targetLanguage, wordCount, expectedQuality } = task;

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
      content: <TaskPrice showTooltip showFootnoteMark={status === TaskStatus.Created} value={currentPrice} />,
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
      footer={<TaskCardFooter {...task} />}
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
