import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { mutate } from 'swr';
import produce from 'immer';
import { notification } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { TaskStatus } from '~/api/linguo';
import { useLinguo } from '~/app/linguo';
import { useWeb3React } from '~/app/web3React';
import SingleFileUpload from '~/components/SingleFileUpload';
import Button from '~/components/Button';
import wrapWithNotification from '~/utils/wrapWithNotification';

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

const withNotification = wrapWithNotification({
  errorMessage: 'Failed to submit the translation',
  successMessage: 'Translation submitted sucessfuly',
  duration: 10,
});

function TranslationUploadButton({ ID, buttonProps }) {
  const linguo = useLinguo();
  const { account } = useWeb3React();

  const [hasPendingTxn, setHasPendingTxn] = React.useState(false);

  const submitTranslation = React.useCallback(
    withNotification(async ({ ID, text, account }) => {
      try {
        setHasPendingTxn(true);
        await linguo.api.submitTranslation({ ID, text }, { from: account });
        mutate(
          ['getTaskById', ID],
          produce(task => {
            task.status = TaskStatus.AwaitingReview;
          })
        );
      } finally {
        setHasPendingTxn(false);
      }
    }),
    [linguo.api]
  );

  const handleChange = React.useCallback(
    async ({ fileList }) => {
      const [file] = fileList;

      if (file?.status === 'done' && !hasPendingTxn) {
        const path = file.response?.path;
        if (!path) {
          throw new Error('Failed to upload the file. Please try again.');
        }

        submitTranslation({ ID, account, text: path });
      }
    },
    [ID, account, submitTranslation, hasPendingTxn]
  );

  return (
    <StyledWrapper>
      {!hasPendingTxn && (
        <SingleFileUpload
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
  ID: t.number.isRequired,
  buttonProps: t.object,
};

TranslationUploadButton.defaultProps = {
  buttonProps: {},
};

export default TranslationUploadButton;
