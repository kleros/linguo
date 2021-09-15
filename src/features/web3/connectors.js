import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { FortmaticConnector } from '~/adapters/web3-react/connectors';
import { defaultChainId, supportedChainIds, jsonRpcUrls } from './supportedChains';

export const injected = new InjectedConnector({ supportedChainIds });
injected.name = 'injected';

export const fortmatic = new FortmaticConnector({
  apiKey: process.env.FORTMATIC_API_KEY,
  chainId: defaultChainId,
});
fortmatic.name = 'fortmatic';

export const network = new NetworkConnector({
  urls: jsonRpcUrls,
  pollingInterval: 20000,
  defaultChainId,
});
network.name = 'network';

export const connectorsByName = [injected, fortmatic, network].reduce(
  (acc, current) =>
    Object.assign(acc, {
      [current.name]: current,
    }),
  {}
);
