import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { mutate } from 'swr';
import { notification } from 'antd';
import { LoadingOutlined, FlagOutlined } from '@ant-design/icons';
import { Task, useLinguo } from '~/app/linguo';
import { useWeb3React } from '~/features/web3';
import SingleFileUpload from '~/components/SingleFileUpload';
import Button from '~/components/Button';
import wrapWithNotification from '~/utils/wrapWithNotification';
import useTask from '../../useTask';

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

const withNotification = wrapWithNotification({
  errorMessage: 'Failed to submit the challenge!',
  successMessage: 'You challenged this translation!',
  duration: 10,
});

function ChallengeUploadButton({ buttonProps }) {
  const { ID } = useTask();
  const linguo = useLinguo();
  const { account } = useWeb3React();

  const [hasPendingTxn, setHasPendingTxn] = React.useState(false);

  const challengeTranslation = React.useCallback(
    withNotification(async ({ ID, evidence, account }) => {
      try {
        setHasPendingTxn(true);
        await linguo.api.challengeTranslation({ ID, evidence }, { from: account });
        mutate(['getTaskById', ID], task => Task.registerChallenge(task, { account }));
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

        challengeTranslation({ ID, account, evidence: path });
      }
    },
    [ID, account, challengeTranslation, hasPendingTxn]
  );

  return (
    <StyledWrapper>
      {!hasPendingTxn && (
        <SingleFileUpload
          forbidRedoAfterSuccess
          beforeUpload={beforeUpload}
          onChange={handleChange}
          buttonContent={{
            idle: {
              text: 'Challenge it',
              icon: <FlagOutlined />,
            },
          }}
          buttonProps={buttonProps}
        />
      )}
      {hasPendingTxn && (
        <Button {...buttonProps} disabled>
          <LoadingOutlined /> Submitting challenge...
        </Button>
      )}
    </StyledWrapper>
  );
}

ChallengeUploadButton.propTypes = {
  buttonProps: t.object,
};

ChallengeUploadButton.defaultProps = {
  buttonProps: {},
};

export default ChallengeUploadButton;
