import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useImperativeRefresh } from '~/adapters/reactRouterDom';
import * as r from '~/app/routes';
import { useWeb3React } from '~/features/web3';
import { Task, TaskStatus, useLinguo } from '~/app/linguo';
import wrapWithNotification from '~/utils/wrapWithNotification';
import Button from '~/components/Button';
import RemainingTime from '~/components/RemainingTime';
import { useTask } from './TaskListContext';

const getTaskDetailsRoute = r.withParamSubtitution(r.TRANSLATION_TASK_DETAILS);

function TaskCardFooter({ ID }) {
  const task = useTask({ ID });

  return (
    <Row gutter={16} align="middle">
      <Col span={12}>
        <TaskFooterInfo {...task} />
      </Col>
      <Col span={12}>
        <Link to={getTaskDetailsRoute({ id: ID })}>
          <Button fullWidth variant="filled" color="primary">
            See details
          </Button>
        </Link>
      </Col>
    </Row>
  );
}

TaskCardFooter.propTypes = {
  ID: t.number.isRequired,
};

export default TaskCardFooter;

function TaskFooterInfo(task) {
  const { ID, status } = task;

  const TaskFooterInfoPending = () => {
    if (Task.isIncomplete(task)) {
      return (
        <RequestReimbursement
          ID={ID}
          buttonProps={{
            fullWidth: true,
            variant: 'outlined',
          }}
        />
      );
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

// TODO: see if we can merge this with TaskInteractionButton
function RequestReimbursement({ ID, buttonProps }) {
  const { account } = useWeb3React();
  const linguo = useLinguo();

  const [isLoading, setIsLoading] = React.useState(false);
  const refresh = useImperativeRefresh();

  const handleClick = React.useCallback(
    withNotification(async () => {
      if (ID === undefined) {
        throw new Error('Failed to reimburse the requester');
      }

      setIsLoading(true);
      try {
        await linguo.api.reimburseRequester({ ID }, { from: account });
        refresh();
      } finally {
        setIsLoading(false);
      }
    }, [linguo.api, ID, account])
  );

  const icon = isLoading ? <LoadingOutlined /> : null;

  return (
    <Button {...buttonProps} onClick={handleClick} disabled={isLoading} icon={icon}>
      Reimburse Me
    </Button>
  );
}

RequestReimbursement.propTypes = {
  ID: t.number.isRequired,
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
