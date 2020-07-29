import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { notification } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { selectAccount } from '~/features/web3/web3Slice';
import { challengeTranslation } from '~/features/tasks/tasksSlice';
import SingleFileUpload from '~/shared/SingleFileUpload';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import useTask from '../../useTask';

export default function ChallengeUploadButton({ buttonProps }) {
  const { id } = useTask();
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);

  const [hasPendingTxn, setHasPendingTxn] = React.useState(false);

  const [uploadedFile, setUploadedFile] = React.useState(null);

  const handleFileChange = React.useCallback(async ({ fileList }) => {
    const [file] = fileList;

    if (!file) {
      setUploadedFile(null);
    } else if (file.status === 'done') {
      const { path, hash } = file.response;
      if (!path) {
        throw new Error('Failed to upload the file. Please try again.');
      }

      setUploadedFile({ path, hash });
    }
  }, []);

  const handleSubmit = React.useCallback(async () => {
    setHasPendingTxn(true);
    try {
      await dispatch(
        challengeTranslation(
          { id, account, uploadedFile },
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
  }, [dispatch, id, account, uploadedFile]);

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
      <Button {...buttonProps} icon={icon} disabled={!uploadedFile || hasPendingTxn} onClick={handleSubmit}>
        {hasPendingTxn ? 'Submitting Challenge...' : 'Challenge It'}
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
