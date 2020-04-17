import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Typography } from 'antd';
import { Task, TaskStatus } from '~/api/linguo';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import useSelfUpdatingState from '~/hooks/useSelfUpdatingState';
import { CalendarIcon } from '~/components/icons';
import FormattedDate from '~/components/FormattedDate';
import FormattedNumber from '~/components/FormattedNumber';
import TaskInfoGrid from './TaskInfoGrid';
import TaskPrice from './TaskPrice';

const StyledTitle = styled(Typography.Title)`
  && {
    font-size: ${props => props.theme.fontSize.xl};
    text-align: center;
  }
`;

const StyledDeadline = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    text-align: center;
  }
`;

const _1_MINUTE_IN_MILISECONDS = 60 * 1000;

function TaskDetails(task) {
  const { title, deadline, assignedPrice, maxPrice, expectedQuality, wordCount } = task;

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
    <>
      <StyledTitle level={2}>{title}</StyledTitle>
      <StyledDeadline>
        <CalendarIcon />
        <span> Translation Deadline: </span>
        <FormattedDate value={deadline} month="long" hour="2-digit" minute="2-digit" timeZoneName="short" />
      </StyledDeadline>
      <TaskInfoGrid data={taskInfo} />
    </>
  );
}

TaskDetails.propTypes = {
  ID: t.number.isRequired,
  title: t.string.isRequired,
  deadline: t.instanceOf(Date).isRequired,
};

TaskDetails.defaultProps = {};

export default TaskDetails;
