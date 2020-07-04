import { AbstractConnector } from '@web3-react/abstract-connector';

const chainIdToNetwork = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
};

export default class FortmaticConnector extends AbstractConnector {
  constructor({ apiKey, chainId }) {
    super({ supportedChainIds: [chainId] });

    this.apiKey = apiKey;
    this.chainId = chainId;
  }

  async activate() {
    if (!this.fortmatic) {
      /**
       * TODO: investigate this.
       *
       * Fortmatic is distributed only as CommonJS module.
       * Looks like parcel deals with this different than webpack when using
       * dynamic import on CommonJS modules. Instead of transforming the CJS
       * module into an ES module and putting the export into the `default`
       * key, it simply resolves the promise with the export itself.
       *
       * However, I'm not able to reproduce this behavior outside this repo.
       */
      let Fortmatic = await import('fortmatic');
      Fortmatic = Fortmatic.default || Fortmatic;

      this.fortmatic = new Fortmatic(
        this.apiKey,
        this.chainId === 1 || this.chainId === 4 ? undefined : chainIdToNetwork[this.chainId]
      );
    }

    const account = await this.fortmatic
      .getProvider()
      .enable()
      .then(accounts => accounts[0]);

    return { provider: this.fortmatic.getProvider(), chainId: this.chainId, account };
  }

  async getProvider() {
    return this.fortmatic.getProvider();
  }

  async getChainId() {
    return this.chainId;
  }

  async getAccount() {
    return this.fortmatic
      .getProvider()
      .send('eth_accounts')
      .then(accounts => accounts[0]);
  }

  deactivate() {}

  async close() {
    await this.fortmatic.user.logout();
    this.emitDeactivate();
  }
}
