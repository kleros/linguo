import { createDefaultClient, createKlerosProxyClient } from '~/adapters/ipfs';

const hostAddress = process.env.IPFS_HOST_ADDRESS || 'http://localhost:5001';
const gatewayAddress = process.env.IPFS_GATEWAY_ADDRESS || 'http://localhost:8080';
const nodeEnv = process.env.NODE_ENV;

const client =
  nodeEnv === 'production'
    ? createKlerosProxyClient({ hostAddress })
    : createDefaultClient({ hostAddress, gatewayAddress });

export default client;
