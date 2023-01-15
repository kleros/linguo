import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { notification, Tooltip } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import SingleFileUpload from '~/shared/SingleFileUpload';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import { useLinguoApi } from '~/hooks/useLinguo';
import publishEvidence, { TEMPLATE_TYPE } from '~/utils/dispute/submitEvidence';

export default function ChallengeUploadButton({ buttonProps }) {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);
  const { challengeTranslation } = useLinguoApi();

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
      const evidence = await publishEvidence(TEMPLATE_TYPE.challenge, task.taskID, { uploadedFile });
      await challengeTranslation(task.taskID, evidence);
    } finally {
      setHasPendingTxn(false);
    }
  }, [challengeTranslation, task.taskID, uploadedFile]);

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
      <Tooltip title={!uploadedFile ? 'Please upload the evidence for the challenge first' : ''}>
        <span>
          <Button {...buttonProps} icon={icon} disabled={!uploadedFile || hasPendingTxn} onClick={handleSubmit}>
            {hasPendingTxn ? 'Submitting Challenge...' : 'Challenge It'}
          </Button>
        </span>
      </Tooltip>
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
