import { nanoid } from 'nanoid';
import { encode as base64Encode } from 'js-base64';
import Web3 from 'web3';

const { sha3 } = Web3.utils;

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
    const normalizedFileName = normalizeFileName(fileName);

    const response = await fetch(`${hostAddress}/add`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        fileName: normalizedFileName,
        buffer,
      }),
    });

    const body = await response.json();

    const collected = body.data;

    const uploadedFile = collected.find(({ path }) => path.includes(normalizedFileName));
    const containingDir = collected.find(({ path }) => path === '/');

    if (!containingDir || !uploadedFile) {
      throw new Error('Failed to upload the file');
    }

    return {
      path: `/ipfs${containingDir.path}${containingDir.hash}${uploadedFile.path}`,
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
    // Removes any trailing slashes
    const normalizedHostAddress = hostAddress.replace(/\/+$/, '');
    // Removes any slashes from the beginning as well as the /ipfs/ prefix
    const normalizedPath = path.replace(/^\/*(ipfs\/|ipfs)?/, '');

    return `${normalizedHostAddress}/ipfs/${normalizedPath}`;
  }

  return { publish, generateUrl };
}

function normalizeFileName(fileName) {
  let { baseName, extension } = splitFileName(fileName);

  baseName = baseName || nanoid(10);
  baseName = isAscii(baseName) ? baseName : base64Encode(sha3(baseName).substr(2, 8));

  return baseName + extension;
}

function splitFileName(fileName) {
  const fileNameParts = (fileName ?? '').split('.');
  if (fileNameParts.length === 1 || (fileNameParts.length === 2 && fileNameParts[0] === '')) {
    return { baseName: fileName.trim(), extension: '' };
  }

  const extension = ('.' + fileNameParts.slice(-1).join('')).trim();
  const baseName = fileNameParts.slice(0, -1).join('.').trim();
  return { baseName, extension };
}

function isAscii(str) {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(str);
}
