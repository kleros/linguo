import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { FortmaticConnector } from '~/adapters/web3React/connectors';

const env = process.env.NODE_ENV ?? 'development';

const defaultChainIdsPerEnv = {
  production: Number(process.env.DEFAULT_CHAIN_ID) ?? 1,
  development: Number(process.env.DEFAULT_CHAIN_ID) ?? 42,
};

const defaultChainId = defaultChainIdsPerEnv[env] ?? 42;

export const injected = new InjectedConnector({
  supportedChainIds: [1, 42],
});
injected.name = 'injected';

export const fortmatic = new FortmaticConnector({
  apiKey: process.env.FORTMATIC_API_KEY,
  chainId: defaultChainId,
});
fortmatic.name = 'fortmatic';

export const network = new NetworkConnector({
  urls: {
    1: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    42: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
  },
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
