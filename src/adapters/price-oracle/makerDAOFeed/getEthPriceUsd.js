import Web3 from 'web3';
import abi from './assets/MedianEthUsd.json';

const providerUrl = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
const provider = new Web3.providers.HttpProvider(providerUrl);
const web3 = new Web3(provider);
const contract = new web3.eth.Contract(abi, '0x64de91f5a373cd4c28de3600cb34c7c6ce410c85');

async function getPriceFromLatestBlocks({ fromBlock }) {
  const events = await contract.getPastEvents('LogMedianPrice', {
    fromBlock,
  });

  if (events.length === 0) {
    throw Object.create(new Error(`No updates since block ${fromBlock}`), {
      code: {
        value: 'ENOTFOUND',
      },
    });
  }

  const lastEvent = events[events.length - 1];
  const price = Number(Web3.utils.fromWei(lastEvent.returnValues.val));

  return price;
}

export default async function getPrice() {
  const maxAttempts = 5;
  let attempts = 0;

  const currentBlockNumber = await web3.eth.getBlockNumber();
  let searchBlocks = 1000;

  while (attempts < maxAttempts) {
    try {
      return await getPriceFromLatestBlocks({
        fromBlock: currentBlockNumber - searchBlocks,
      });
    } catch (err) {
      if (err.code !== 'ENOTFOUND') {
        throw err;
      }

      attempts += 1;
      searchBlocks *= 10;
    }
  }
}
