import ipfs from '~/app/ipfs';

export default function getFileUrl(path) {
  return ipfs.generateUrl(path);
}
