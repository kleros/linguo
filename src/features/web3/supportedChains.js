const env = process.env.NODE_ENV ?? 'development';

const defaultChainIdsPerEnv = {
  production: Number(process.env.DEFAULT_CHAIN_ID) ?? 1,
  development: Number(process.env.DEFAULT_CHAIN_ID) ?? 77,
};

export const defaultChainId = defaultChainIdsPerEnv[env] ?? 77;

export const jsonRpcUrls = JSON.parse(process.env.JSON_RPC_URLS);

export const supportedChainIds = [1, 42, 77];
