import React from 'react';
import t from 'prop-types';
import { Upload, Tooltip } from 'antd';
import { UploadOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ipfs from '~/app/ipfs';
import Button from '~/components/Button';
import useStateMachine from '~/hooks/useStateMachine';

export async function validator(fileList) {
  const { status, path } = fileList?.[fileList.length - 1]?.response || {};

  /**
   * TODO: for some reason, antd Upload component is not properly setting
   * `status = 'uploading'` when `customRequest` is passed as prop.
   * For now, we assume `status === undefined` is the same as `status === 'uploading'`.
   */
  if (status === undefined) {
    throw new Error('Please wait for the upload to finish.');
  }

  if (status === 'error') {
    throw new Error('Please upload another file or remove all the failed ones.');
  }

  if (!path) {
    throw new Error('Something wrong with the uploaded file. Please remove it and try again.');
  }
}

const uploadStateMachine = {
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'pending',
        ERROR: 'errored',
      },
    },
    pending: {
      on: {
        RESET: 'idle',
        SUCCESS: 'succeeded',
        ERROR: 'errored',
      },
    },
    succeeded: {
      on: {
        RESET: 'idle',
      },
    },
    errored: {
      on: {
        RESET: 'idle',
      },
    },
  },
};

function SingleFileUpload({ beforeUpload, onChange, buttonContent, buttonProps }) {
  const [state, send] = useStateMachine(uploadStateMachine);

  const disabled = state !== 'idle';
  const tooltip = disabled ? 'Remove the file from the list to be able to add another one' : '';

  const handleBeforeUpload = React.useCallback(
    file => {
      const valid = beforeUpload(file);
      if (!valid) {
        send('ERROR');
      }

      return valid;
    },
    [beforeUpload, send]
  );

  const handleRemove = React.useCallback(() => {
    send('RESET');
  }, [send]);

  const customRequest = React.useCallback(
    async ({ file, onError, onProgress, onSuccess }) => {
      try {
        send('START');
        const result = await ipfs.publish(file.name, await file.arrayBuffer(), {
          onProgress: bytesProcessed => {
            const percent = (bytesProcessed / file.size) * 100;
            onProgress({ percent }, file);
          },
        });

        onSuccess(
          {
            status: 'done',
            url: ipfs.generateUrl(result.path),
            ...result,
          },
          file
        );
        send('SUCCESS');
      } catch (err) {
        onError(err, { status: 'error', message: err.message }, file);
        send('ERROR', { error: err });
      }
    },
    [send]
  );

  return (
    <Upload beforeUpload={handleBeforeUpload} onChange={onChange} onRemove={handleRemove} customRequest={customRequest}>
      <Tooltip title={tooltip}>
        <span>
          <Button {...buttonProps} disabled={disabled}>
            {buttonContent[state]}
          </Button>
        </span>
      </Tooltip>
    </Upload>
  );
}

SingleFileUpload.propTypes = {
  beforeUpload: t.func,
  onChange: t.func,
  buttonContent: t.shape({
    idle: t.node.isRequired,
    pending: t.node.isRequired,
    succeeded: t.node.isRequired,
    errored: t.node.isRequired,
  }),
  buttonProps: t.object,
};

SingleFileUpload.defaultProps = {
  beforeUpload: () => true,
  onChange: () => {},
  buttonContent: {
    idle: (
      <>
        <UploadOutlined /> Upload a File
      </>
    ),
    pending: (
      <>
        <LoadingOutlined /> Uploading...
      </>
    ),
    succeeded: (
      <>
        <CheckCircleOutlined /> Done!
      </>
    ),
    errored: (
      <>
        <CloseCircleOutlined /> Failed!
      </>
    ),
  },
  buttonProps: {},
};

export default SingleFileUpload;
