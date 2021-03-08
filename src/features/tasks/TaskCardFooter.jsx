import React from 'react';
import t from 'prop-types';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Col, Row } from 'antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import RemainingTime from '~/shared/RemainingTime';
import { Task, TaskStatus } from '~/features/tasks';
import { selectAccount } from '~/features/web3/web3Slice';
import TaskParty from './entities/TaskParty';
import { selectById } from './tasksSlice';
import TaskInteractionButton from './TaskInteractionButton';

export default function TaskCardFooter({ id, rightSideContent }) {
  const task = useShallowEqualSelector(selectById(id));

  return (
    <Row gutter={16} align="middle">
      <Col span={12}>
        <LeftSideContent {...task} />
      </Col>
      <Col span={12}>{rightSideContent}</Col>
    </Row>
  );
}

TaskCardFooter.propTypes = {
  id: t.oneOfType([t.number, t.string]).isRequired,
  rightSideContent: t.node,
};

TaskCardFooter.defaultProps = {
  rightSideContent: null,
};

function LeftSideContent(task) {
  const { id, status } = task;
  const account = useSelector(selectAccount);

  const TaskFooterInfoPending = () => {
    if (Task.isIncomplete(task)) {
      const isRequester = task.parties[TaskParty.Requester] === account;

      return isRequester ? (
        <TaskInteractionButton
          id={id}
          interaction={TaskInteractionButton.Interaction.Reimburse}
          content={{
            idle: { text: 'Reimburse Me' },
          }}
          buttonProps={{ fullWidth: true }}
        />
      ) : null;
    }

    const currentDate = new Date();
    const timeout = Task.remainingTimeForSubmission(task, { currentDate });

    return (
      <RemainingTime
        initialValueSeconds={timeout}
        render={({ formattedValue, endingSoon }) => (
          <TaskCardFooterInfoDisplay
            title="Deadline"
            content={formattedValue}
            color={endingSoon ? 'danger' : 'default'}
          />
        )}
      />
    );
  };

  const TaskFooterInfoAwaitingReview = () => {
    const currentDate = new Date();
    const timeout = Task.remainingTimeForReview(task, { currentDate });

    return timeout > 0 ? (
      <RemainingTime
        initialValueSeconds={timeout}
        render={({ formattedValue, endingSoon }) => (
          <TaskCardFooterInfoDisplay
            title="Deadline"
            content={formattedValue}
            color={endingSoon ? 'danger' : 'default'}
          />
        )}
      />
    ) : (
      <TaskCardFooterInfoDisplay title="Review time is over" content="Click to see more" />
    );
  };

  const taskFooterInfoByStatusMap = {
    [TaskStatus.Created]: TaskFooterInfoPending,
    [TaskStatus.Assigned]: TaskFooterInfoPending,
    [TaskStatus.AwaitingReview]: TaskFooterInfoAwaitingReview,
    [TaskStatus.DisputeCreated]: () => null,
    [TaskStatus.Resolved]: () => null,
  };

  const Component = taskFooterInfoByStatusMap[status];
  return <Component />;
}

export function TaskCardFooterInfoDisplay({ title, content, titleLevel, color }) {
  const TitleTag = `h${titleLevel}`;

  return (
    <StyledInfoDisplay className={color}>
      <TitleTag className="title">{title}</TitleTag>
      <div className="content">{content}</div>
    </StyledInfoDisplay>
  );
}

TaskCardFooterInfoDisplay.propTypes = {
  title: t.node.isRequired,
  content: t.node.isRequired,
  titleLevel: t.oneOf([1, 2, 3, 4, 5, 6]),
  color: t.oneOf(['default', 'danger', 'success', 'info', 'warning']),
};

TaskCardFooterInfoDisplay.defaultProps = {
  titleLevel: 4,
};

const StyledInfoDisplay = styled.div`
  text-align: center;

  > .title {
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: ${p => p.theme.fontWeight.regular};
    color: ${p => p.theme.color.text.lighter};
    margin-bottom: -0.25rem;
  }

  > .content {
    font-size: ${p => p.theme.fontSize.md};
    font-weight: ${p => p.theme.fontWeight.semibold};
    color: ${p => p.theme.color.text.default};
  }

  &.info {
    > .content {
      color: ${p => p.theme.color.info.default};
    }
  }

  &.warning {
    > .content {
      color: ${p => p.theme.color.warning.default};
    }
  }

  &.danger {
    > .content {
      color: ${p => p.theme.color.danger.default};
    }
  }

  &.success {
    > .content {
      color: ${p => p.theme.color.success.default};
    }
  }
`;
