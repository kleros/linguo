import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { notification, Tooltip } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import SingleFileUpload from '~/shared/SingleFileUpload';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import { useWeb3 } from '~/hooks/useWeb3';
import { useLinguoApi } from '~/hooks/useLinguo';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';

const initialState = { path: null, hash: null };

export default function TranslationUploadButton({ buttonProps }) {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);
  const { submitTranslation } = useLinguoApi();

  const [hasPendingTxn, setHasPendingTxn] = React.useState(false);

  const [uploadedFile, setUploadedFile] = React.useState(initialState);

  const handleFileChange = React.useCallback(async ({ fileList }) => {
    const [file] = fileList;

    if (!file) {
      setUploadedFile(initialState);
    } else if (file.status === 'done') {
      const { path, hash } = file.response;
      if (!path) {
        throw new Error('Failed to upload the file. Please try again.');
      }

      setUploadedFile({ path, hash });
    }
  }, []);

  console.log({ uploadedFile });
  const handleSubmit = React.useCallback(async () => {
    setHasPendingTxn(true);
    try {
      await submitTranslation(task.taskID, uploadedFile.path);
    } finally {
      setHasPendingTxn(false);
    }
  }, [submitTranslation, task.taskID, uploadedFile.path]);

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
            text: 'Translated Text',
          },
        }}
        buttonProps={{
          fullWidth: true,
          variant: 'outlined',
        }}
      />
      <Spacer />
      <Tooltip title={!uploadedFile ? 'Please upload the translated text first' : ''}>
        <span>
          <Button {...buttonProps} icon={icon} disabled={!uploadedFile || hasPendingTxn} onClick={handleSubmit}>
            {hasPendingTxn ? 'Submitting Translation...' : 'Submit Translation'}
          </Button>
        </span>
      </Tooltip>
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

  return true;
};
