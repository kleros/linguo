import ipfsClient from 'ipfs-http-client';

const hostAddress = process.env.IPFS_HOST_ADDRESS || 'http://localhost:5001';
const gatewayAddress = process.env.IPFS_GATEWAY_ADDRESS || 'http://localhost:8080';

const ipfs = ipfsClient(hostAddress);

export { ipfs as default };

export function generateUrl(path) {
  return `${gatewayAddress}/ipfs/${path}`;
}
