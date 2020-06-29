import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import { useShallowEqualSelector } from '~/adapters/reactRedux';
import { useImperativeRefresh } from '~/adapters/reactRouterDom';
import { useLinguo } from '~/app/linguo';
import * as r from '~/app/routes';
import Button from '~/components/Button';
import RemainingTime from '~/components/RemainingTime';
import { Task, TaskStatus } from '~/features/tasks';
import { selectAccount } from '~/features/web3/web3Slice';
import wrapWithNotification from '~/utils/wrapWithNotification';
import TaskParty from './entities/TaskParty';
import { selectById } from './tasksSlice';

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
        <RequestReimbursement
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

const withNotification = wrapWithNotification({
  successMessage: 'Reimbursement requested with success!',
  errorMessage: 'Failed to request the reimbursement!',
});

const RequestReimbursement = function RequestReimbursement({ id, buttonProps }) {
  const account = useSelector(selectAccount);
  const linguo = useLinguo();

  const [isLoading, setIsLoading] = React.useState(false);
  const refresh = useImperativeRefresh();

  const handleClick = React.useCallback(
    withNotification(async () => {
      if (id === undefined) {
        throw new Error('Failed to reimburse the requester');
      }

      setIsLoading(true);
      try {
        await linguo.api.reimburseRequester({ id }, { from: account });
        refresh();
      } finally {
        setIsLoading(false);
      }
    }, [linguo.api, id, account])
  );

  const icon = isLoading ? <LoadingOutlined /> : null;

  return (
    <Button {...buttonProps} onClick={handleClick} disabled={isLoading} icon={icon}>
      Reimburse Me
    </Button>
  );
};

RequestReimbursement.propTypes = {
  id: t.string.isRequired,
  buttonProps: t.object,
};

RequestReimbursement.defaultProps = {
  buttonProps: {},
};

const StyledTaskDeadline = styled.div`
  text-align: center;
  font-weight: 700;
  line-height: 1.33;

  &.ending-soon {
    color: ${props => props.theme.color.danger.default};
  }

  .title {
    font-size: ${props => props.theme.fontSize.sm};
    margin-bottom: -0.25rem;
  }

  .value {
    font-size: ${props => props.theme.fontSize.xl};
  }
`;

const StyledCallToAction = styled.div`
  text-align: center;

  .headline {
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: 700;
  }

  .text {
    font-size: ${props => props.theme.fontSize.xs};
    font-weight: 400;
    color: ${props => props.theme.color.text.light};
  }
`;
