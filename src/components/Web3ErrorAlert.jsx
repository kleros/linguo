import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
import { Alert } from '~/adapters/antd';
// import Button from '~/shared/Button';
import getErrorMessage from '~/adapters/web3-react/getErrorMessage';
import { useWeb3 } from '~/hooks/useWeb3';
import WalletConnectionButton from '~/components/WalletConnectionButton';

function Web3ErrorAlert() {
  const { chainId } = useWeb3();

  const web3Error = true;
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
