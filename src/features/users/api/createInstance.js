import { Base64 } from 'js-base64';

const SIGNED_MESSAGE =
  'To keep your data safe, we ask that you sign this message to create a secret key for your account. This key is unrelated to your Ethereum account and will not be able to send any transactions on your behalf.';

export default function createInstance({ web3, apiBaseUrl }) {
  async function updateSettings({ account, token = null, data }) {
    let privateKey;
    if (token) {
      privateKey = await _tokenToPrivateKey(token);
    } else {
      privateKey = await _generateDerivedPrivateKey({ account, key: SIGNED_MESSAGE });
      token = await _privateKeyToToken(privateKey);
    }

    const derivedAccount = web3.eth.accounts.privateKeyToAccount(privateKey);

    const { signature, message } = await derivedAccount.sign(JSON.stringify(data));

    const url = `${apiBaseUrl}/user/${account}/settings`;
    const response = await fetch(url, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        derivedAccountAddress: derivedAccount.address,
        message,
        signature,
      }),
    });

    const body = await response.json();

    if (response.status !== 200) {
      throw new Error(body.error);
    }

    return {
      token,
      data,
    };
  }

  async function getSettings({ account, token = null }) {
    if (!token) {
      return {
        data: {},
      };
    }

    const privateKey = await _tokenToPrivateKey(token);
    const derivedAccount = web3.eth.accounts.privateKeyToAccount(privateKey);

    const data = { message: 'Give me the data!' };
    const { signature, message } = await derivedAccount.sign(JSON.stringify(data));

    const params = new URLSearchParams({
      message,
      signature,
    });

    const url = `${apiBaseUrl}/user/${account}/settings?${params}`;
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    const body = await response.json();

    if (response.status !== 200) {
      throw new Error(body.error?.message ?? 'Unknown error');
    }

    return {
      data: body?.data ?? {},
    };
  }

  async function generateToken({ account }) {
    const privateKey = await _generateDerivedPrivateKey({ account, key: SIGNED_MESSAGE });
    return await _privateKeyToToken(privateKey);
  }

  async function _privateKeyToToken(privateKey) {
    return Base64.encode(privateKey);
  }

  async function _tokenToPrivateKey(token) {
    return Base64.decode(token);
  }

  async function _generateDerivedPrivateKey({ account, key }) {
    const secret = await web3.eth.personal.sign(key, account);
    return web3.utils.keccak256(secret);
  }

  return {
    generateToken,
    updateSettings,
    getSettings,
  };
}
