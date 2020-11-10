import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Upload, Typography } from 'antd';
import { UploadOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ipfs from '~/app/ipfs';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import { InfoIcon } from '~/shared/icons';
import useStateMachine from '~/shared/useStateMachine';

export default function SingleFileUpload({
  accept,
  fullWidth,
  beforeUpload,
  disabled,
  onChange,
  buttonContent,
  buttonProps,
  className,
}) {
  const [state, send] = useStateMachine(uploadStateMachine);

  const finalDisabled = disabled || state === 'pending';

  const [fileList, setFileList] = React.useState([]);

  const handleChange = React.useCallback(
    info => {
      const newFileList = info.fileList
        .slice(-1) // take only the latest item
        .map(file => (file.response ? { ...file, url: file.response.url } : file));

      setFileList(newFileList);

      onChange(info);
    },
    [onChange]
  );

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

  const icon = buttonContent[state]?.icon ?? defaultButtonContent[state].icon;
  const text = buttonContent[state]?.text ?? defaultButtonContent[state].text;
  const finalButtonProps = fullWidth
    ? {
        ...buttonProps,
        fullWidth: true,
      }
    : buttonProps;

  return (
    <StyledUpload
      $fullWidth={fullWidth}
      accept={accept}
      beforeUpload={handleBeforeUpload}
      fileList={fileList}
      onChange={handleChange}
      onRemove={handleRemove}
      customRequest={customRequest}
      className={className}
    >
      <Button {...finalButtonProps} icon={icon} disabled={finalDisabled}>
        {text}
      </Button>
      {fileList?.[0]?.status === 'done' ? (
        <>
          <Spacer size={0.5} />
          <StyledInfo>
            <InfoIcon /> You can click on the file name below to visualize it.
          </StyledInfo>
        </>
      ) : null}
    </StyledUpload>
  );
}

const buttonContentShape = t.shape({
  text: t.node,
  icon: t.node,
});

SingleFileUpload.propTypes = {
  accept: t.oneOfType([t.string, t.arrayOf(t.string)]),
  beforeUpload: t.func,
  disabled: t.bool,
  fullWidth: t.bool,
  onChange: t.func,
  buttonContent: t.shape({
    idle: buttonContentShape,
    pending: buttonContentShape,
    succeeded: buttonContentShape,
    errored: buttonContentShape,
  }),
  buttonProps: t.object,
  className: t.string,
};

const defaultButtonContent = {
  idle: {
    text: 'Upload a File',
    icon: <UploadOutlined />,
  },
  pending: {
    text: ' Uploading...',
    icon: <LoadingOutlined />,
  },
  succeeded: {
    text: 'Done!',
    icon: <CheckCircleOutlined />,
  },
  errored: {
    text: 'Failed! Please try again',
    icon: <CloseCircleOutlined />,
  },
};

SingleFileUpload.defaultProps = {
  accept: '*/*',
  beforeUpload: () => true,
  disabled: false,
  fullWidth: false,
  onChange: () => {},
  buttonContent: defaultButtonContent,
  buttonProps: {},
  className: '',
};

const _1_MB = 2e10 * 2e10;
const _100_MB = 100 * _1_MB;

export async function validator(fileList, { allowedTypes = '*', maxSize = _100_MB } = {}) {
  const file = fileList?.[fileList.length - 1] || {};

  const { type, size } = file;
  const { status, path } = file.response ?? {};

  if (allowedTypes !== '*') {
    allowedTypes = [].concat(allowedTypes).flatMap(type => type.split(/s*,s*/g));

    if (!allowedTypes.includes(type)) {
      throw new Error('File extension is not valid.');
    }
  }

  if (size > maxSize) {
    throw new Error('File is too big.');
  }

  /**
   * FIXME: for some reason, antd Upload component is not properly setting
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

const StyledUpload = styled(Upload)`
  .ant-upload {
    display: ${p => (p.$fullWidth ? 'block' : 'inline-block')};
  }
`;

const StyledInfo = styled(Typography.Text)`
  display: inline-block;
  text-align: left;
  color: ${p => p.theme.color.text.light};
`;
