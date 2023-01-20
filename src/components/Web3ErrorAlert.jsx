import React from 'react';
import { useSelector } from 'react-redux';
import { Alert } from '~/adapters/antd';
import getErrorMessage from '~/adapters/web3-react/getErrorMessage';
import WalletConnectionButton from './WalletConnectionButton';
import { selectError } from '~/features/web3/web3Slice';
import { useWeb3 } from '~/hooks/useWeb3';

function Web3ErrorAlert() {
  const web3Error = useSelector(selectError);
  const { chainId } = useWeb3();

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

export default Web3ErrorAlert;
