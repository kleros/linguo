import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Redirect } from 'react-router-dom';
import { Row, Col, Typography, Spin, Alert } from 'antd';
import * as r from '~/app/routes';
import { useWeb3React } from '~/app/web3React';
import { useLinguo } from '~/api/linguo';
import TaskCard from './TaskCard';

const StyledSpin = styled(Spin)`
  &&.ant-spin {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const StyledRow = styled(Row)`
  // make cards in the same row to have the same height
  align-items: stretch;
`;

function useAsyncState(getState, initialValue) {
  const [state, setState] = React.useState({
    tag: 'idle',
    data: initialValue,
    error: '',
  });

  const fetch = React.useCallback(async () => {
    setState(tasks => ({
      ...tasks,
      tag: 'loading',
      error: '',
    }));
    try {
      setState({
        tag: 'succeeded',
        data: await getState(),
        error: '',
      });
    } catch (err) {
      setState({
        tag: 'errored',
        data: initialValue,
        error: err.message,
      });
    }
  }, [initialValue, getState]);

  React.useEffect(() => {
    fetch();
  }, [fetch]);

  const { data, error } = state;

  return {
    data,
    error,
    isIdle: state.tag === 'idle',
    isLoading: state.tag === 'loading',
    isSuccess: state.tag === 'succeeded',
    isError: state.tag === 'errored',
  };
}

const emptyTaskList = [];

function TaskCardList() {
  const { library: web3, chainId, account } = useWeb3React();
  const { api } = useLinguo({ web3, chainId });

  const { data, error, isError, isLoading, isSuccess } = useAsyncState(
    React.useCallback(async () => api.getOwnTasks(account), [api, account]),
    emptyTaskList
  );

  return isSuccess && data.length === 0 ? (
    <Redirect
      to={{
        pathname: r.TRANSLATION_CREATION,
        state: {
          message: 'You have no tranlsation requests yet! You can create one here.',
        },
      }}
    />
  ) : (
    <StyledSpin tip="Loading the translations tasks you created..." spinning={isLoading}>
      {isError && <Alert type="error" message={error} />}
      <StyledRow gutter={[32, { xs: 0, sm: 32 }]}>
        {data.map(task => {
          return (
            <Col key={task.ID} xs={24} sm={24} md={12} lg={8}>
              <TaskCard {...task} />
            </Col>
          );
        })}
      </StyledRow>
      {data.length > 0 && (
        <Typography.Text>
          <sup>*</sup>Approximate value: the actual price is defined when a translator is assigned to the task.
        </Typography.Text>
      )}
    </StyledSpin>
  );
}

TaskCardList.propTypes = {
  isLoading: t.bool.isRequired,
  data: t.arrayOf(t.object),
  error: t.string,
};

TaskCardList.defaultProps = {
  isLoading: false,
  data: [],
};

export default TaskCardList;
