import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import * as r from '~/app/routes';
import Button from '~/shared/Button';
import RemainingTime from '~/shared/RemainingTime';
import { Task, TaskStatus } from '~/features/tasks';
import { selectAccount } from '~/features/web3/web3Slice';
import TaskParty from './entities/TaskParty';
import { selectById, reimburseRequester } from './tasksSlice';

const getTaskDetailsRoute = r.withParamSubtitution(r.TRANSLATION_TASK_DETAILS);

function TaskCardFooter({ id }) {
  const task = useShallowEqualSelector(selectById(id));

  return (
    <Row gutter={16} align="middle">
      <Col span={12}>
        <TaskFooterInfo {...task} />
      </Col>
      <Col span={12}>
        <Link to={getTaskDetailsRoute({ id })}>
          <Button fullWidth variant="filled" color="primary">
            See details
          </Button>
        </Link>
      </Col>
    </Row>
  );
}

TaskCardFooter.propTypes = {
  id: t.oneOfType([t.number, t.string]).isRequired,
};

export default TaskCardFooter;

function TaskFooterInfo(task) {
  const { id, status } = task;
  const account = useSelector(selectAccount);

  const TaskFooterInfoPending = () => {
    if (Task.isIncomplete(task)) {
      const isRequester = task.parties[TaskParty.Requester] === account;

      return isRequester ? (
        <RequestReimbursementButton
          id={id}
          buttonProps={{
            fullWidth: true,
            variant: 'outlined',
          }}
        />
      ) : null;
    }

    const currentDate = new Date();
    const timeout = Task.remainingTimeForSubmission(task, { currentDate });

    return (
      <RemainingTime
        initialValueSeconds={timeout}
        render={({ formattedValue, endingSoon }) => (
          <StyledTaskDeadline
            className={clsx({
              'ending-soon': endingSoon,
            })}
          >
            <div className="title">Deadline</div>
            <div className="value">{formattedValue}</div>
          </StyledTaskDeadline>
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
          <StyledTaskDeadline
            className={clsx({
              'ending-soon': endingSoon,
            })}
          >
            <div className="title">Deadline</div>
            <div className="value">{formattedValue}</div>
          </StyledTaskDeadline>
        )}
      />
    ) : (
      <StyledCallToAction>
        <div className="headline">Review time is over!</div>
        <div className="text">See details to proceed.</div>
      </StyledCallToAction>
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

const RequestReimbursementButton = function RequestReimbursement({ id, buttonProps }) {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = React.useCallback(async () => {
    setIsLoading(true);

    try {
      await dispatch(
        reimburseRequester(
          { id, account },
          {
            meta: {
              thunk: { id },
              tx: { wait: 0 },
            },
          }
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, id, account]);

  const icon = isLoading ? <LoadingOutlined /> : null;

  return (
    <Button {...buttonProps} onClick={handleClick} disabled={isLoading} icon={icon}>
      Reimburse Me
    </Button>
  );
};

RequestReimbursementButton.propTypes = {
  id: t.string.isRequired,
  buttonProps: t.object,
};

RequestReimbursementButton.defaultProps = {
  buttonProps: {},
};

const StyledTaskDeadline = styled.div`
  text-align: center;
  line-height: 1.33;

  &.ending-soon {
    color: ${props => props.theme.color.danger.default};
  }

  .title {
    font-size: ${props => props.theme.fontSize.sm};
    margin-bottom: -0.25rem;
    font-weight: ${p => p.theme.fontWeight.medium};
  }

  .value {
    font-size: ${props => props.theme.fontSize.xl};
    font-weight: ${p => p.theme.fontWeight.semibold};
  }
`;

const StyledCallToAction = styled.div`
  text-align: center;

  .headline {
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: ${p => p.theme.fontWeight.bold};
  }

  .text {
    font-size: ${props => props.theme.fontSize.xs};
    font-weight: ${p => p.theme.fontWeight.regular};
    color: ${props => props.theme.color.text.light};
  }
`;
