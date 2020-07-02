import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { notification } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { submitTranslation } from '~/features/tasks/tasksSlice';
import { selectAccount } from '~/features/web3/web3Slice';
import SingleFileUpload from '~/components/SingleFileUpload';
import Button from '~/components/Button';
import useTask from '../../useTask';

export default function TranslationUploadButton({ buttonProps }) {
  const dispatch = useDispatch();
  const { id } = useTask();
  const account = useSelector(selectAccount);

  const [hasPendingTxn, setHasPendingTxn] = React.useState(false);

  const submitOnFileUpload = React.useCallback(
    async ({ path }) => {
      setHasPendingTxn(true);
      try {
        await dispatch(
          submitTranslation(
            { id, path, account },
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
    },
    [dispatch, id, account]
  );

  const handleChange = React.useCallback(
    async ({ fileList }) => {
      const [file] = fileList;

      if (file?.status === 'done' && !hasPendingTxn) {
        const path = file.response?.path;
        if (!path) {
          throw new Error('Failed to upload the file. Please try again.');
        }

        submitOnFileUpload({ path });
      }
    },
    [submitOnFileUpload, hasPendingTxn]
  );

  return (
    <StyledWrapper>
      {!hasPendingTxn && (
        <SingleFileUpload
          accept="text/plain"
          forbidRedoAfterSuccess
          beforeUpload={beforeUpload}
          onChange={handleChange}
          buttonProps={buttonProps}
        />
      )}
      {hasPendingTxn && (
        <Button {...buttonProps} disabled>
          <LoadingOutlined /> Sending translation...
        </Button>
      )}
    </StyledWrapper>
  );
}

TranslationUploadButton.propTypes = {
  buttonProps: t.object,
};

TranslationUploadButton.defaultProps = {
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

  const isPlainTextFile = file.type === 'text/plain';
  if (!isPlainTextFile) {
    notification.error({
      message: 'File must be plain text (.txt)',
      placement: 'bottomRight',
    });
    return false;
  }

  return true;
};
