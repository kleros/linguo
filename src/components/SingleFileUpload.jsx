import React from 'react';
import t from 'prop-types';
import { Upload, Tooltip } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import ipfs from '~/app/ipfs';
import Button from '~/components/Button';

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
      },
    },
    pending: {
      on: {
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

function uploadStateReducer(state, action) {
  return uploadStateMachine.states[state]?.on?.[action] || state;
}

function SingleFileUpload({ beforeUpload, onChange }) {
  const [state, send] = React.useReducer(uploadStateReducer, uploadStateMachine.initial);

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

  const isUploadButtonDisabled = state !== 'idle';
  const uploadButtonTooltip = isUploadButtonDisabled ? 'Remove the uploaded file to be able to add another one' : '';
  const uploadButtonIcon = state === 'pending' ? <LoadingOutlined /> : <UploadOutlined />;

  return (
    <Upload beforeUpload={beforeUpload} onChange={onChange} onRemove={handleRemove} customRequest={customRequest}>
      <Tooltip title={uploadButtonTooltip}>
        <span>
          <Button variant="outlined" disabled={isUploadButtonDisabled}>
            {uploadButtonIcon}
            Upload a File
          </Button>
        </span>
      </Tooltip>
    </Upload>
  );
}

SingleFileUpload.propTypes = {
  beforeUpload: t.func,
  onChange: t.func,
};

SingleFileUpload.defaultProps = {
  beforeUpload: () => true,
  onChange: t.func,
};

export default SingleFileUpload;
