import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import styled from 'styled-components';

import RemainingTime from '~/shared/RemainingTime';
import { HourGlassIcon } from '~/shared/icons';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import { useLinguoApi } from '~/hooks/useLinguo';

import Task from '~/utils/task';
import taskStatus from '~/consts/taskStatus';

function TaskDeadline({ showPrefix, render }) {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const { getReviewTimeout } = useLinguoApi();
  const reviewTimeout = getReviewTimeout();

  const timeout = Task.isPending(task.status)
    ? Task.getRemainedSubmissionTime(task.status, task.deadline)
    : task.status === taskStatus.AwaitingReview
    ? Task.getRemainedReviewTime(task.status, task.lastInteraction, reviewTimeout)
    : undefined;

  if (timeout === undefined) {
    return null;
  }

  return <RemainingTime initialValueSeconds={timeout} showPrefix={showPrefix} render={render} />;
}

TaskDeadline.propTypes = {
  className: t.string,
  showPrefix: t.bool,
  render: t.func,
};

TaskDeadline.defaultProps = {
  className: '',
  showPrefix: false,
  render: DefaultTaskDeadlineRender,
};

export default TaskDeadline;

function DefaultTaskDeadlineRender({ endingSoon, formattedValue }) {
  return (
    <StyledTaskDeadline
      className={clsx({
        'ending-soon': endingSoon,
      })}
    >
      <StyledHourGlassIcon />
      <span>{formattedValue}</span>
    </StyledTaskDeadline>
  );
}

DefaultTaskDeadlineRender.propTypes = {
  endingSoon: t.bool.isRequired,
  formattedValue: t.string.isRequired,
};

const StyledHourGlassIcon = styled(HourGlassIcon)``;

const StyledTaskDeadline = styled.div`
  display: flex;
  align-items: center;
  color: ${p => p.theme.color.text.default};
  font-size: ${p => p.theme.fontSize.lg};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.ending-soon {
    color: ${p => p.theme.color.danger.default};
  }

  ${StyledHourGlassIcon} {
    margin-right: 0.5rem;
  }
`;
