import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import {
  fetchByTaskId,
  selectByTaskId,
  selectIsLoadingByTaskId,
  selectErrorByTaskId,
} from '~/features/evidences/evidencesSlice';
import Spacer from '~/shared/Spacer';

export default function EvidenceFetcher({ render }) {
  const { id: taskId } = useParams();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoadingByTaskId(taskId));
  const data = useShallowEqualSelector(selectByTaskId(taskId));
  const error = useShallowEqualSelector(selectErrorByTaskId(taskId));

  const doFetch = React.useCallback(() => {
    dispatch(fetchByTaskId({ taskId }));
  }, [dispatch, taskId]);

  React.useEffect(() => {
    doFetch();
  }, [doFetch]);

  return (
    <Spin tip="Getting evidences..." spinning={isLoading && !data}>
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
      {data && render(data)}
    </Spin>
  );
}

EvidenceFetcher.propTypes = {
  render: t.func.isRequired,
};
