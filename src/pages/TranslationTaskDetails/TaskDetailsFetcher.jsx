import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Spin } from 'antd';
import { useWeb3React } from '~/app/web3React';
import useAsyncState from '~/hooks/useAsyncState';
import { useLinguo } from '~/api/linguo';
import TaskDetails from './TaskDetails';

const StyledSpin = styled(Spin)`
  &&.ant-spin {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const emptyTask = {};
function TaskDetailsFetcher() {
  const { id } = useParams();
  const { library: web3, chainId } = useWeb3React();
  const linguo = useLinguo({ web3, chainId });

  const [{ data, error, isLoading, isSuccess }] = useAsyncState(
    React.useCallback(async () => linguo.api.getTaskById({ ID: id }), [linguo.api, id]),
    emptyTask,
    { runImmediately: true }
  );

  return (
    <StyledSpin tip="Loading the translation tasks detials" spinning={isLoading}>
      {error ? <div>Task with ID {id} could not be found.</div> : isSuccess ? <TaskDetails {...data} /> : null}
    </StyledSpin>
  );
}

TaskDetailsFetcher.propTypes = {};

TaskDetailsFetcher.defaultProps = {};

export default TaskDetailsFetcher;
