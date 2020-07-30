import { UnsupportedChainIdError } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';

export default function getErrorMessage(error) {
  if (error instanceof NoEthereumProviderError || error.name === 'NoEthereumProviderError') {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.';
  } else if (error instanceof UnsupportedChainIdError || error.name === 'UnsupportedChainIdError') {
    return 'You are connected to an unsupported network.';
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error.name === 'UserRejectedRequestErrorInjected' ||
    // Metamask error below
    error.message === 'User denied account authorization'
  ) {
    return 'Please authorize this website to access your Ethereum account.';
  } else if (/MetaMask Tx Signature:\s+/.test(error.message)) {
    return error.message.replace(/MetaMask Tx Signature:\s+/, '');
  } else {
    console.warn('Unrecognized error', error);
    return error.message;
  }
}
