import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { notification } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { selectAccount } from '~/features/web3/web3Slice';
import { challengeTranslation } from '~/features/tasks/tasksSlice';
import SingleFileUpload from '~/components/SingleFileUpload';
import Button from '~/components/Button';
import Spacer from '~/components/Spacer';
import useTask from '../../useTask';

export default function ChallengeUploadButton({ buttonProps }) {
  const { id } = useTask();
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);

  const [hasPendingTxn, setHasPendingTxn] = React.useState(false);

  const [path, setPath] = React.useState(null);

  const handleFileChange = React.useCallback(async ({ fileList }) => {
    const [file] = fileList;

    if (!file) {
      setPath(null);
    } else if (file.status === 'done') {
      const path = file.response?.path;
      if (!path) {
        throw new Error('Failed to upload the file. Please try again.');
      }

      setPath(path);
    }
  }, []);

  const handleSubmitChallenge = React.useCallback(async () => {
    setHasPendingTxn(true);
    try {
      await dispatch(
        challengeTranslation(
          { id, account, path },
          {
            meta: {
              tx: { wait: 0 },
              thunk: { id },
            },
          }
        )
      );
    } finally {
      setHasPendingTxn(false);
    }
  }, [dispatch, id, account, path]);

  const icon = hasPendingTxn ? <LoadingOutlined /> : null;

  return (
    <StyledWrapper>
      <SingleFileUpload
        forbidRedoAfterSuccess
        disabled={hasPendingTxn}
        beforeUpload={beforeUpload}
        onChange={handleFileChange}
        buttonContent={{
          idle: {
            text: 'Evidence for Challenge',
          },
        }}
        buttonProps={{
          fullWidth: true,
          variant: 'outlined',
        }}
      />
      <Spacer />
      <Button {...buttonProps} icon={icon} disabled={!path || hasPendingTxn} onClick={handleSubmitChallenge}>
        {hasPendingTxn ? <>Submitting challenge...</> : <>Challenge It</>}
      </Button>
    </StyledWrapper>
  );
}

ChallengeUploadButton.propTypes = {
  buttonProps: t.object,
};

ChallengeUploadButton.defaultProps = {
  buttonProps: {},
};

const StyledWrapper = styled.div`
  &,
  .ant-upload {
    width: 100%;
  }

  .ant-upload-list {
    text-align: left;
  }
`;

const beforeUpload = file => {
  const isLt100M = file.size / 1024 / 1024 < 100;
  if (!isLt100M) {
    notification.error({
      message: 'File must smaller than 100 MB!',
      placement: 'bottomRight',
    });
    return false;
  }

  return true;
};
