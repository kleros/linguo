import { greaterThan } from '~/adapters/big-number';
import badgeAbi from './abis/badge.json';
import erc20Abi from './abis/ERC20.json';
import tokensViewAbi from './abis/tokensView.json';
import { ADDRESS_ZERO, MAX_UINT256 } from './constants';
import t2crInfo from './fixtures/t2cr.json';
import normalizeBaseUnit from './normalizeBaseUnit';

const filter = [
  false, // Do not include items which are not on the TCR.
  true, // Include registered items.
  false, // Do not include items with pending registration requests.
  true, // Include items with pending clearing requests.
  false, // Do not include items with challenged registration requests.
  true, // Include items with challenged clearing requests.
  false, // Include token if caller is the author of a pending request.
  false, // Include token if caller is the challenger of a pending request.
];

export default function createTokensApi({ library: web3 }) {
  const erc20Token = new web3.eth.Contract(erc20Abi);

  async function fetchAll({ chainId }) {
    const addresses = t2crInfo[chainId];
    if (!addresses) {
      throw new Error(`Cannot fetch tokens for network ${chainId}`);
    }

    const t2crAddr = addresses.t2cr;
    const stablecoinBadgeAddr = addresses.stablecoin;
    const tokensViewAddr = addresses.tokensView;

    const badgeContract = new web3.eth.Contract(badgeAbi, stablecoinBadgeAddr);
    const tokensViewContract = new web3.eth.Contract(tokensViewAbi, tokensViewAddr);

    const addressesWithBadge = (
      await badgeContract.methods
        .queryAddresses(
          ADDRESS_ZERO, // A token address to start/end the query from. Set to zero means unused.
          200, // Number of items to return at once.
          filter,
          true // Return oldest first.
        )
        .call()
    ).values.filter(address => address !== ADDRESS_ZERO);

    const submissionIDs = await tokensViewContract.methods
      .getTokensIDsForAddresses(t2crAddr, addressesWithBadge)
      .call();

    const fetchedTokens = (await tokensViewContract.methods.getTokens(t2crAddr, submissionIDs).call())
      .filter(tokenInfo => tokenInfo[3] !== ADDRESS_ZERO)
      .reduce(
        (acc, curr) => ({
          ...acc,
          [curr[3]]: curr,
        }),
        {}
      );

    return fetchedTokens;
  }

  async function checkAllowance({ tokenAddress, spender, owner, amount }) {
    if (tokenAddress === ADDRESS_ZERO) {
      return;
    }

    const contract = erc20Token.clone();
    contract.options.address = tokenAddress;

    let balance;
    let allowance;
    try {
      [allowance, balance] = await Promise.all([
        contract.methods.allowance(owner, spender).call({ from: owner }),
        contract.methods.balanceOf(owner).call({ from: owner }),
      ]);
    } catch (err) {
      console.warn('Failed to get allowance amount:', err);
      throw new Error('Failed to check spending limit.');
    }

    amount = normalizeBaseUnit(amount, await _getDecimals(contract));

    if (greaterThan(amount, balance)) {
      throw Object.create(new Error('Not enough balance.'), {
        name: {
          value: 'NotEnoughBalanceError',
          enumerable: true,
        },
      });
    }

    if (greaterThan(amount, allowance)) {
      throw Object.create(new Error('Not allowed to spend this amount.'), {
        name: {
          value: 'NotEnoughAllowanceError',
          enumerable: true,
        },
      });
    }
  }

  async function approve({ tokenAddress, spender, owner, amount }) {
    if (tokenAddress === ADDRESS_ZERO) {
      throw new Error('ETH does not require approval to be spent.');
    }

    const contract = erc20Token.clone();
    contract.options.address = tokenAddress;

    amount = (amount ?? Infinity) === Infinity ? MAX_UINT256 : normalizeBaseUnit(amount, await _getDecimals(contract));

    const tx = contract.methods.approve(spender, amount).send({ from: owner });

    return { tx };
  }

  async function _getDecimals(contract) {
    try {
      const decimals = await contract.methods.decimals().call();
      return decimals;
    } catch (err) {
      return '18';
    }
  }

  return {
    fetchAll,
    checkAllowance,
    approve,
  };
}
