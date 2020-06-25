import Web3 from 'web3';
import erc20Abi from './abis/ERC20.json';
import { ADDRESS_ZERO, MAX_UINT256 } from './constants';

const { toWei, toBN } = Web3.utils;

export default function createTokenApi({ library }) {
  const web3 = library;

  const erc20Token = new web3.eth.Contract(erc20Abi);

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
    checkAllowance,
    approve,
  };
}
