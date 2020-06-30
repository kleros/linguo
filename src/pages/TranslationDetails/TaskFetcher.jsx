import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Alert } from 'antd';
import { Spin } from '~/adapters/antd';
import { useShallowEqualSelector } from '~/adapters/reactRedux';
import { useRefreshEffectOnce } from '~/adapters/reactRouterDom';
import { fetchById, selectById, selectIsLoadingById, selectErrorById } from '~/features/tasks/tasksSlice';
import Spacer from '~/features/shared/Spacer';
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

  useRefreshEffectOnce(doFetch);

  return (
    <Spin $centered tip="Getting task details..." spinning={isLoading && !data}>
      {error && (
        <>
          <Alert
            type="warning"
            message={error.message}
            description={
              data
                ? 'You are currently viewing a cached version which not might reflect the current state in the blockchain.'
                : null
            }
          />
          <Spacer size={2} />
        </>
      )}
      {data && (
        <TaskProvider task={data}>
          <TaskDetails />
        </TaskProvider>
      )}
    </Spin>
  );
}
