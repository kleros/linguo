import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert } from 'antd';
import { selectError, deactivate } from '~/features/web3/web3Slice';
import getErrorMessage from '~/features/web3/getErrorMessage';
import Button from '~/components/Button';
import WalletConnectionButton from './WalletConnectionButton';

function Web3ErrorAlert() {
  const dispatch = useDispatch();
  const web3Error = useSelector(selectError);

  const handleDisconnectClick = React.useCallback(
    evt => {
      evt.preventDefault();
      dispatch(deactivate());
    },
    [dispatch]
  );

  return web3Error ? (
    <Alert
      banner
      showIcon={false}
      type="warning"
      message={<>{getErrorMessage(web3Error)}</>}
      description={
        <>
          You could{' '}
          <Button variant="link" onClick={handleDisconnectClick}>
            use Linguo in read-only mode
          </Button>{' '}
          or try to <WalletConnectionButton variant="link">connect to a different wallet</WalletConnectionButton>.
        </>
      }
    />
  ) : null;
}

export default Web3ErrorAlert;
