export default function createClient({ hostAddress }) {
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
   * @param {ProgressCallback} [options.onProgress] - Function to track progress of the upload.
   * @return {PublishResult} ipfs response. Should include the hash and path of the stored item.
   */
  async function publish(fileName, data, { onProgress: _ignored } = {}) {
    const buffer = await Buffer.from(data);

    const response = await fetch(`${hostAddress}/add`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        buffer,
      }),
    });

    const body = await response.json();

    const collected = body.data;

    const uploadedFile = collected.find(({ path }) => path.includes(fileName));
    const containingDir = collected.find(({ path }) => path === '/');

    if (!containingDir || !uploadedFile) {
      throw new Error('Failed to upload the file');
    }

    return {
      path: `${containingDir.hash}${uploadedFile.path}`,
      hash: uploadedFile.hash,
    };
  }

  /**
   * Generates a full URL from a IPFS path.
   *
   * @param {string} path - The IPFS path.
   * @return {string} - The full URL.
   */
  function generateUrl(path) {
    return `${hostAddress}/ipfs/${path}`;
  }

  return { publish, generateUrl };
}
