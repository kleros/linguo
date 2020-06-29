import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Tooltip, Typography } from 'antd';
import { useShallowEqualSelector } from '~/adapters/reactRedux';
import { Task, TaskStatus, useCacheCall } from '~/app/linguo';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import Card from '~/components/Card';
import FormattedNumber from '~/components/FormattedNumber';
import TaskLanguages from './TaskLanguages';
import TaskCardFooter from './TaskCardFooter';
import TaskInfoGrid from './TaskInfoGrid';
import TaskPrice from './TaskPrice';
import { selectById } from './tasksSlice';

const StyledCard = styled(Card)`
  && {
    height: 100%;
  }
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

const _1_MINUTE_IN_MILLISECONDS = 60 * 1000;

function TaskCard({ id }) {
  const task = useShallowEqualSelector(selectById(id));
  const { status, title, assignedPrice, sourceLanguage, targetLanguage, wordCount, expectedQuality, token } = task;

  const hasAssignedPrice = assignedPrice !== undefined;

  const shouldRevalidate = !(hasAssignedPrice || Task.isIncomplete(task));
  const refreshInterval = shouldRevalidate ? _1_MINUTE_IN_MILLISECONDS : 0;

  const [{ data: currentPrice }] = useCacheCall(['getTaskPrice', id], {
    initialData: Task.currentPrice(task),
    revalidateOnFocus: shouldRevalidate,
    revalidateOnReconnect: shouldRevalidate,
    refreshInterval,
  });
  const actualPrice = assignedPrice ?? currentPrice;

  const pricePerWord = Task.currentPricePerWord({
    currentPrice: actualPrice,
    wordCount,
  });

  const { name = '', requiredLevel = '' } = translationQualityTiers[expectedQuality] || {};

  const taskInfo = [
    {
      title: 'Price per word',
      content: <TaskPrice showTooltip token={token} value={pricePerWord} />,
    },
    {
      title: 'Number of words',
      content: <FormattedNumber value={wordCount} />,
    },
    {
      title: 'Total Price',
      content: (
        <TaskPrice
          showTooltip
          token={token}
          showFootnoteMark={status === TaskStatus.Created && !Task.isIncomplete(task)}
          value={currentPrice}
        />
      ),
    },
    {
      title: name,
      content: requiredLevel,
    },
  ];

  return (
    <StyledCard
      title={<TaskLanguages fullWidth source={sourceLanguage} target={targetLanguage} />}
      titleLevel={2}
      footer={<TaskCardFooter id={id} />}
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
  id: t.string.isRequired,
};

export default TaskCard;
