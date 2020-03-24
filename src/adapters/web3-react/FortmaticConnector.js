import { AbstractConnector } from '@web3-react/abstract-connector';

const chainIdToNetwork = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
};

/**
 * TODO: find the issue which is preventing the original @web3-react/fortmatic-connector
 * to use dynamic imports properly with parcel.
 */
export class FortmaticConnector extends AbstractConnector {
  constructor({ apiKey, chainId }) {
    super({ supportedChainIds: [chainId] });

    this.apiKey = apiKey;
    this.chainId = chainId;
  }

  async activate() {
    if (!this.fortmatic) {
      const Fortmatic = await import('fortmatic');
      console.log(Fortmatic);
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
