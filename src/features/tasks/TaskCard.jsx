import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Tooltip, Typography } from 'antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import Card from '~/shared/Card';
import FormattedNumber from '~/shared/FormattedNumber';
import useInterval from '~/shared/useInterval';
import { Task, TaskStatus } from '~/features/tasks';
import EthFiatValue from '~/features/tokens/EthFiatValue';
import TaskCardFooter from './TaskCardFooter';
import TaskInfoGrid from './TaskInfoGrid';
import TaskLanguages from './TaskLanguages';
import TaskPrice from './TaskPrice';
import { selectById } from './tasksSlice';

const _1_MINUTE_MS = 60 * 1000;

export default function TaskCard({ id }) {
  const task = useShallowEqualSelector(selectById(id));
  const { status, title, assignedPrice, sourceLanguage, targetLanguage, wordCount, expectedQuality } = task;

  const getCurrentPrice = React.useCallback(() => Task.currentPrice(task), [task]);
  const [currentPrice, setCurrentPrice] = React.useState(getCurrentPrice);

  const updateCurrentPrice = React.useCallback(() => {
    setCurrentPrice(getCurrentPrice());
  }, [getCurrentPrice, setCurrentPrice]);

  const interval = assignedPrice === undefined ? _1_MINUTE_MS : null;
  useInterval(updateCurrentPrice, interval);

  const actualPrice = assignedPrice ?? currentPrice;

  const pricePerWord = Task.currentPricePerWord({
    currentPrice: actualPrice,
    wordCount,
  });

  const { name = '', requiredLevel = '' } = translationQualityTiers[expectedQuality] || {};

  const taskInfo = [
    {
      title: 'Price per Word',
      content: <TaskPrice showTooltip value={pricePerWord} />,
      footer: <EthFiatValue amount={pricePerWord} render={({ formattedValue }) => `(${formattedValue})`} />,
    },
    {
      title: 'Word Count',
      content: <FormattedNumber value={wordCount} />,
    },
    {
      title: 'Total Price',
      content: (
        <TaskPrice
          showTooltip
          showFootnoteMark={status === TaskStatus.Created && !Task.isIncomplete(task)}
          value={currentPrice}
        />
      ),
      footer: <EthFiatValue amount={currentPrice} render={({ formattedValue }) => `(${formattedValue})`} />,
    },
    {
      title: 'Quality Tier',
      content: name,
      footer: `(${requiredLevel}+)`,
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
    font-weight: ${p => p.theme.fontWeight.semibold};
    margin-bottom: 1rem;
  }
`;
