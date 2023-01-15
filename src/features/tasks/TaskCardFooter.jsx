import React, { useState, useEffect } from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Col, Row } from 'antd';

import TaskInteractionButton from './TaskInteractionButton';
import RemainingTime from '~/shared/RemainingTime';

import { useWeb3 } from '~/hooks/useWeb3';
import { getReviewTimeout } from '~/hooks/useLinguo';
import Task from '~/utils/task';
import taskStatus from '~/consts/taskStatus';

export default function TaskCardFooter({ data, contractAddress, rightSideContent }) {
  return (
    <Row gutter={16} align="middle">
      <Col span={12}>
        <LeftSideContent data={data} contractAddress={contractAddress} />
      </Col>
      <Col span={12}>{rightSideContent}</Col>
    </Row>
  );
}

TaskCardFooter.propTypes = {
  contractAddress: t.string.isRequired,
  data: t.shape({
    deadline: t.string.isRequired,
    lastInteraction: t.string.isRequired,
    minPrice: t.string.isRequired,
    maxPrice: t.string.isRequired,
    requesterDeposit: t.string.isRequired,
    submissionTimeout: t.string.isRequired,
    status: t.oneOf(Object.values(taskStatus)).isRequired,
    taskID: t.string.isRequired,
    translation: t.string.isRequired,
  }),
  rightSideContent: t.node,
};

TaskCardFooter.defaultProps = {
  rightSideContent: null,
};

LeftSideContent.propTypes = {
  contractAddress: t.string.isRequired,
  data: t.shape({
    deadline: t.string.isRequired,
    lastInteraction: t.string.isRequired,
    requester: t.string.isRequired,
    submissionTimeout: t.string.isRequired,
    status: t.oneOf(Object.values(taskStatus)).isRequired,
    taskID: t.string.isRequired,
    translation: t.string.isRequired,
  }),
  rightSideContent: t.node,
};

function LeftSideContent({ data, contractAddress }) {
  const [reviewTimeout, setReviewTimeout] = useState(0);

  const { deadline, lastInteraction, requester, taskID, translation, status, submissionTimeout } = data;
  const { account, library } = useWeb3();
  const _isIncomplete = Task.isIncomplete(status, translation, lastInteraction, submissionTimeout);

  useEffect(() => {
    const fetchReviewTimeout = async () => {
      const timeout = await getReviewTimeout(contractAddress, library);
      setReviewTimeout(timeout);
    };
    fetchReviewTimeout();
  }, [contractAddress, library]);

  const TaskFooterInfoPending = () => {
    if (_isIncomplete) {
      const isRequester = requester === account.toLowerCase();

      return isRequester ? (
        <TaskInteractionButton
          id={taskID}
          interaction={TaskInteractionButton.Interaction.Reimburse}
          content={{
            idle: { text: 'Reimburse Me' },
          }}
          buttonProps={{ fullWidth: true }}
        />
      ) : null;
    }
    const timeout = Task.getRemainedSubmissionTime(status, deadline);

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
    const timeout = Task.getRemainedReviewTime(status, lastInteraction, reviewTimeout.toString());

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
    [taskStatus.Created]: TaskFooterInfoPending,
    [taskStatus.Assigned]: TaskFooterInfoPending,
    [taskStatus.AwaitingReview]: TaskFooterInfoAwaitingReview,
    [taskStatus.DisputeCreated]: () => null,
    [taskStatus.Resolved]: () => null,
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
