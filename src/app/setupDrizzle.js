import { Drizzle } from '@drizzle/store';
import { Linguo } from '@kleros/contract-deployments/interactions/linguo';

const drizzleOptions = {
  contracts: [Linguo],
  polls: {
    accounts: 3000,
    blocks: 3000,
  },
  web3: {
    block: true,
    fallback: {
      type: 'ws',
      url: `wss://kovan.infura.io/ws/v3/${process.env.INFURA_API_KEY}`,
    },
  },
};

const drizzle = new Drizzle(drizzleOptions);

export default drizzle;
