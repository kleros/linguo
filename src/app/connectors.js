import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';

export const injected = new InjectedConnector({ supportedChainIds: [1, 42] });

export const network = new NetworkConnector({
  urls: {
    1: `https://mainnet.infura.io/ws/v3/${process.env.INFURA_API_KEY}`,
    42: `https://kovan.infura.io/ws/v3/${process.env.INFURA_API_KEY}`,
  },
  defaultChainId: 42,
  pollingInterval: 3000,
});
