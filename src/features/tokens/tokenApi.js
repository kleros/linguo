import Web3 from 'web3';
import erc20Abi from './abis/ERC20.json';
import badgeAbi from './abis/badge.json';
import tokensViewAbi from './abis/tokensView.json';
import { ADDRESS_ZERO, MAX_UINT256 } from './constants';
import t2crInfo from './fixtures/t2cr.json';

const { toWei, toBN } = Web3.utils;

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

export default function createTokenApi({ library: web3 }) {
  const erc20Token = new web3.eth.Contract(erc20Abi);

  async function fetchTokens({ chainId }) {
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

    let allowance;
    try {
      allowance = await contract.methods.allowance(owner, spender).call({ from: owner });
    } catch (err) {
      console.warn('Failed to get allowance amount:', err);
      throw new Error('Failed to check spending limit.');
    }

    amount = toBN(toWei(String(amount)));

    if (amount.lte(toBN(allowance))) {
      return;
    }

    throw new Error('Not allowed to spend this amount.');
  }

  async function approve({ tokenAddress, spender, owner, amount }) {
    amount = (amount || Infinity) === Infinity ? MAX_UINT256 : toWei(String(amount));

    const contract = erc20Token.clone();
    contract.options.address = tokenAddress;

    const tx = contract.methods.approve(spender, amount).send({ from: owner });

    return { tx };
  }

  return {
    fetchTokens,
    checkAllowance,
    approve,
  };
}
