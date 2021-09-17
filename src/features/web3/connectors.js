import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { defaultChainId, supportedChainIds, jsonRpcUrls } from './supportedChains';

export const injected = new InjectedConnector({ supportedChainIds });
injected.name = 'injected';

export const network = new NetworkConnector({
  urls: jsonRpcUrls,
  pollingInterval: 20000,
  defaultChainId,
});
network.name = 'network';

export const walletConnect = new WalletConnectConnector({
  rpc: jsonRpcUrls,
});
walletConnect.name = 'walletConnect';

export const connectorsByName = [injected, network].reduce(
  (acc, current) =>
    Object.assign(acc, {
      [current.name]: current,
    }),
  {}
);
