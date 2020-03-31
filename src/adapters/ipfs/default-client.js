import ipfsClient from 'ipfs-http-client';

export default function createClient({ hostAddress, gatewayAddress = hostAddress }) {
  const ipfs = ipfsClient(hostAddress);

  /**
   * @callback ProgressCallback - Callback to track progress of an upload.
   * @param {int} bytesProcessed - The amount of bytes processed so far.
   *
   *
   * @typedef {Object} PublishResult
   * @property {string} path - The path of the published file.
   * @property {string} hash - The hash of the published file.
   *
   * Send file to IPFS network via the Kleros IPFS node.
   *
   * @param {string} fileName - The name that will be used to store the file. This is useful to preserve extension type.
   * @param {ArrayBuffer} data - The raw data from the file to upload.
   * @param {object} [options] - Additional options.
   * @param {ProgressCallback} [options.onProgress] - Function to track progress of the upload. This parameter is currently ignored.
   * @return {PublishResult} ipfs response. Should include the hash and path of the stored item.
   */
  async function publish(fileName, data, { onProgress } = {}) {
    const fileDetails = {
      path: fileName,
      content: await Buffer.from(data),
    };

    const options = {
      progress: onProgress,
      wrapWithDirectory: true,
    };

    const source = ipfs.add(fileDetails, options);

    const collected = [];
    for await (const result of source) {
      collected.push(result);
    }

    const uploadedFile = collected.find(({ path }) => path.includes(fileName));
    const containingDir = collected.find(({ path }) => path === '');

    if (!containingDir || !uploadedFile) {
      throw new Error('Failed to upload the file');
    }

    return {
      path: `/ipfs/${containingDir.cid}/${uploadedFile.path}`,
      hash: uploadedFile.cid.toString(),
    };
  }

  /**
   * Generates a full URL from a IPFS path.
   *
   * @param {string} path - The IPFS path.
   * @return {string} - The full URL.
   */
  function generateUrl(path) {
    // Removes any trailing slashes
    const normalizedGatewayAddress = gatewayAddress.replace(/\/+$/, '');
    // Removes any slashes from the beginning as well as the /ipfs/ prefix
    const normalizedPath = path.replace(/^\/+(ipfs\/)?/, '');

    return `${normalizedGatewayAddress}/ipfs/${normalizedPath}`;
  }

  return { publish, generateUrl };
}
