import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { FortmaticConnector } from '~/adapters/web3React/connectors';

export const injected = new InjectedConnector({
  supportedChainIds: [1, 42],
});
injected.name = 'injected';

export const fortmatic = new FortmaticConnector({
  apiKey: process.env.FORTMATIC_API_KEY,
  chainId: 42,
});
fortmatic.name = 'fortmatic';

export const network = new NetworkConnector({
  urls: {
    1: `https://mainnet.infura.io/ws/v3/${process.env.INFURA_API_KEY}`,
    42: `https://kovan.infura.io/ws/v3/${process.env.INFURA_API_KEY}`,
  },
  defaultChainId: 42,
  pollingInterval: 3000,
});
network.name = 'network';

export const connectorsByName = [injected, fortmatic, network].reduce(
  (acc, current) =>
    Object.assign(acc, {
      [current.name]: current,
    }),
  {}
);
