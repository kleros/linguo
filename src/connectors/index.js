import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

import { SUPPORTED_CHAINIDS, RPC_URLS } from '../consts/supportedChains';
import { defaultChainId } from '../consts/defaultChainId';
import { NetworkConnector } from './Network';

export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAINIDS,
});
injected.name = 'injected';

export const walletConnect = new WalletConnectConnector({
  rpc: RPC_URLS,
});
walletConnect.name = 'walletConnect';

export const network = new NetworkConnector({
  urls: RPC_URLS,
  pollingInterval: 20000,
  defaultChainId,
});
network.name = 'network';

export const connectors = { injected, walletConnect, network };
