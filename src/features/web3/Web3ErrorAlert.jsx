import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Alert } from '~/adapters/antd';
// import Button from '~/shared/Button';
import getErrorMessage from '~/adapters/web3-react/getErrorMessage';
import WalletConnectionButton from './WalletConnectionButton';
// import { selectError, deactivate } from './web3Slice';
import { selectError, selectChainId } from './web3Slice';

function Web3ErrorAlert() {
  // const dispatch = useDispatch();
  const web3Error = useSelector(selectError);
  const chainId = useSelector(selectChainId);

  // const handleDisconnectClick = React.useCallback(
  //   evt => {
  //     evt.preventDefault();
  //     dispatch(deactivate());
  //   },
  //   [dispatch]
  // );

  return web3Error ? (
    <Alert
      banner
      showIcon={false}
      type="warning"
      message={<>{chainId === -1 ? '' : getErrorMessage(web3Error)}</>}
      description={<WalletConnectionButton variant="link">Connect to a wallet.</WalletConnectionButton>}
    />
  ) : null;
}

// <>
//   You could{' '}
//   <Button variant="link" onClick={handleDisconnectClick}>
//     use Linguo in read-only mode
//   </Button>{' '}
//   or try to <WalletConnectionButton variant="link">connect to a different wallet</WalletConnectionButton>.
// </>
export default Web3ErrorAlert;
