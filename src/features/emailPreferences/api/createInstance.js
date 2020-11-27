import { Base64 } from 'js-base64';

const SIGNED_MESSAGE =
  'To keep your data safe, we ask that you sign this message to create a secret key for your account. This key is unrelated to your Ethereum account and will not be able to send any transactions on your behalf.';

export default function createInstance({ web3, apiBaseUrl }) {
  async function update({ account, token = null, payload }) {
    let privateKey;
    if (token) {
      privateKey = await _tokenToPrivateKey(token);
    } else {
      privateKey = await _generateDerivedPrivateKey({ account, key: SIGNED_MESSAGE });
      token = await _privateKeyToToken(privateKey);
    }

    const derivedAccount = web3.eth.accounts.privateKeyToAccount(privateKey);

    const { signature, message } = await derivedAccount.sign(JSON.stringify(payload));

    const dataToSubmit = {
      derivedAccountAddress: derivedAccount.address,
      message,
      signature,
    };

    const url = `${apiBaseUrl}/user/${account}/settings`;
    const response = await fetch(url, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSubmit),
    });

    const body = await response.json();

    if (response.status !== 200) {
      throw new Error(body.error);
    }

    return {
      token,
      data: payload,
    };
  }

  async function get({ account, token = null }) {
    if (!token) {
      return {
        data: {},
      };
    }

    const privateKey = await _tokenToPrivateKey(token);
    const derivedAccount = web3.eth.accounts.privateKeyToAccount(privateKey);

    const payload = { message: 'Give me the data!' };
    const { signature, message } = await derivedAccount.sign(JSON.stringify(payload));

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
      throw new Error(body.error.message);
    }

    const { email, fullName, preferences } = body?.data ?? {};

    return {
      data: { email, fullName, preferences },
    };
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
    update,
    get,
  };
}
