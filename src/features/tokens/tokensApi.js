import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk';
import supportedChainIds from './supportedChainIds';

export async function getEthPrice({ chainId }) {
  if (!supportedChainIds[chainId]) {
    return '0';
  }

  const USDC = getUSDC(chainId);
  const pair = await getPair(USDC);
  const route = new Route([pair], WETH[USDC.chainId]);

  return route.midPrice.toFixed(2);
}

const UsdcAddressesByChainId = {
  [ChainId.KOVAN]: '0xb7a4f3e9097c08da09517b5ab877f7a917224ede',
  [ChainId.MAINNET]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
};

function getUSDC(chainId) {
  return new Token(chainId, UsdcAddressesByChainId[chainId], 6);
}

function getPair(USDC) {
  return Fetcher.fetchPairData(USDC, WETH[USDC.chainId]);
}
