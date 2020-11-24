import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { fetchById, selectById, selectIsLoadingById, selectErrorById } from '~/features/tasks/tasksSlice';
import Spacer from '~/shared/Spacer';
import { TaskProvider } from './TaskContext';
import TaskDetails from './TaskDetails';

export default function TaskFetcher() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoadingById(id));
  const data = useShallowEqualSelector(selectById(id));
  const error = useShallowEqualSelector(selectErrorById(id));

  const doFetch = React.useCallback(() => {
    dispatch(fetchById({ id }));
  }, [dispatch, id]);

  React.useEffect(() => {
    doFetch();
  }, [doFetch]);

  return (
    <Spin tip="Getting task details..." spinning={isLoading && !data}>
      {error && (
        <>
          <Alert
            showIcon
            type={error.recoverable ? 'warning' : 'error'}
            message={error.message}
            description={
              error.recoverable
                ? 'You are currently viewing a cached version which not might reflect the current state in the blockchain.'
                : null
            }
          />
          <Spacer size={2} />
        </>
      )}
      {data && (!error || error.recoverable) ? (
        <TaskProvider task={data}>
          <TaskDetails />
        </TaskProvider>
      ) : null}
    </Spin>
  );
}
