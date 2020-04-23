import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { useLinguo } from '~/app/linguo';
import useAsyncState from '~/hooks/useAsyncState';
import TaskDetails from './TaskDetails';

const StyledSpin = styled(Spin)`
  &&.ant-spin {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const StyledAlert = styled(Alert)`
  && {
    margin-bottom: 2rem;
  }
`;

const emptyTask = {};
function TaskDetailsFetcher() {
  const { id } = useParams();
  const linguo = useLinguo();

  const [{ data, error, isLoading, isSuccess }] = useAsyncState(
    React.useCallback(async () => linguo.api.getTaskById({ ID: id }), [linguo.api, id]),
    emptyTask,
    { runImmediately: true }
  );

  return (
    <StyledSpin tip="Loading the translation tasks details" spinning={isLoading}>
      {error ? (
        <StyledAlert type="error" message={`Details for task ${id} could not be loaded.`} />
      ) : isSuccess ? (
        <TaskDetails {...data} />
      ) : null}
    </StyledSpin>
  );
}

TaskDetailsFetcher.propTypes = {};

TaskDetailsFetcher.defaultProps = {};

export default TaskDetailsFetcher;
