import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { Contract } from '@ethersproject/contracts';
import { BigNumber, constants } from 'ethers';

import Linguo from '@kleros/linguo-contracts/artifacts/contracts/0.7.x/Linguo.sol/Linguo.json';
import IArbitrator from '@kleros/erc-792/build/contracts/IArbitrator.json';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';

const NON_PAYABLE_VALUE = BigNumber.from(2).pow(256).sub(1);

const fetcher = (library, abi) => args => {
  if (!library) return;
  const [arg1, arg2, ...params] = args;
  const address = arg1;
  const method = arg2;
  const contract = new Contract(address, abi, library);
  return contract[method](...params);
};

export const useLinguoApi = () => {
  const { account, chainId, library } = useWeb3();
  const { address: contractAddress } = useParamsCustom(chainId);
  const [address, setAddress] = useState(contractAddress);

  useEffect(() => {
    if (!contractAddress) return;
    setAddress(contractAddress);
  }, [contractAddress]);

  const _call = (_address, abi, method, ...args) => {
    const { data } = useSWR(typeof _address !== 'undefined' ? [_address, method, ...args] : false, {
      fetcher: fetcher(library, abi),
    });
    return data;
  };

  const _send = async (method, { args, value }) => {
    const contract = new Contract(address, Linguo.abi, library.getSigner());

    const numberOfArgs = contract.interface.getFunction(method).inputs.length;
    if (args.length !== numberOfArgs && args.length !== numberOfArgs + 1) {
      throw new Error(`Invalid number of arguments for function: ${method} `);
    }

    const tx = await contract[method](...args, { value: value });
    return tx;
  };

  const _increase = value => ({
    by: percentage => {
      const amount = value.mul(percentage).div(100);
      return value.add(amount);
    },
  });

  const getAmountWithdrawable = taskID => {
    const amount = _call(address, Linguo.abi, LinguoInteraction.amountWithdrawable, taskID, account);
    return amount === undefined || amount.eq(constants.Zero) ? 0 : amount.toString();
  };

  const getArbitrationCost = () => {
    const arbitratorExtraData = _call(address, Linguo.abi, LinguoInteraction.arbitratorExtraData);
    const arbitrator = _call(address, Linguo.abi, LinguoInteraction.arbitrator);
    const cost = _call(arbitrator, IArbitrator.abi, ArbitratorInteraction.arbitrationCost, arbitratorExtraData);

    return cost ?? NON_PAYABLE_VALUE;
  };

  const getAppealCost = disputeID => {
    const arbitratorExtraData = _call(address, Linguo.abi, LinguoInteraction.arbitratorExtraData);
    const arbitrator = _call(address, Linguo.abi, LinguoInteraction.arbitrator);
    const cost = _call(arbitrator, IArbitrator.abi, ArbitratorInteraction.appealCost, disputeID, arbitratorExtraData);

    return cost ?? NON_PAYABLE_VALUE;
  };

  const getChallengeDeposit = taskID => {
    const deposit = _call(address, Linguo.abi, LinguoInteraction.getChallengeValue, taskID);
    return (deposit && deposit.toString()) || undefined;
  };

  const getTranslatorDeposit = taskID => {
    const deposit = _call(address, Linguo.abi, LinguoInteraction.getDepositValue, taskID);
    return (deposit && deposit.toString()) || undefined;
  };

  const getDisputeStatus = disputeID => {
    const arbitrator = _call(address, Linguo.abi, LinguoInteraction.arbitrator);
    return _call(arbitrator, IArbitrator.abi, ArbitratorInteraction.disputeStatus, disputeID);
  };

  const getReviewTimeout = (_address = address) => {
    const timeout = _call(_address, Linguo.abi, LinguoInteraction.reviewTimeout);
    return (timeout && timeout.toString()) || undefined;
  };

  const getRewardPoolParams = () => {
    const winnerStakeMultiplier = _call(address, Linguo.abi, 'winnerStakeMultiplier') ?? 0;
    const loserStakeMultiplier = _call(address, Linguo.abi, 'loserStakeMultiplier') ?? 0;
    const sharedStakeMultiplier = _call(address, Linguo.abi, 'sharedStakeMultiplier') ?? 0;
    const multiplierDivisor = _call(address, Linguo.abi, 'MULTIPLIER_DIVISOR') ?? 0;

    return { winnerStakeMultiplier, loserStakeMultiplier, sharedStakeMultiplier, multiplierDivisor };
  };

  const createTask = async (deadline, minPrice, metaEvidence, maxPrice) => {
    return await _send(LinguoInteraction.createTask, {
      args: [deadline, minPrice, metaEvidence],
      value: maxPrice,
    });
  };

  const assignTask = async taskID => {
    const translationDeposit = await _call(address, Linguo.abi, LinguoInteraction.getDepositValue, taskID);
    const safeTranslationDeposit = _increase(translationDeposit).by(1);

    return await _send(LinguoInteraction.assignTask, { args: [taskID], value: safeTranslationDeposit });
  };

  const acceptTranslation = async taskID => {
    return await _send(LinguoInteraction.acceptTranslation, { args: [taskID] });
  };

  const challengeTranslation = async (taskID, evidence) => {
    const challengeDeposit = await _call(address, Linguo.abi, LinguoInteraction.getChallengeValue, taskID);
    const safeChallengeDeposit = _increase(challengeDeposit).by(1);

    return await _send(LinguoInteraction.challengeTranslation, {
      args: [taskID, evidence],
      value: safeChallengeDeposit,
    });
  };

  const submitTranslation = async (taskID, translation) => {
    return await _send(LinguoInteraction.submitTranslation, { args: [taskID, translation] });
  };

  const submitEvidence = async (taskID, evidence) => {
    return await _send(LinguoInteraction.submitEvidence, { args: [taskID, evidence] });
  };

  const fundAppeal = async (taskID, party, totalAppealCost) => {
    return await _send(LinguoInteraction.fundAppeal, { args: [taskID, party], value: totalAppealCost });
  };

  const reimburseRequester = async taskID => {
    return await _send('reimburseRequester', { args: [taskID] });
  };

  const withdrawAllFeesAndRewards = async taskID => {
    return await _send(LinguoInteraction.withdrawAllFeesAndRewards, { args: [account, taskID, 0, 0] });
  };

  return {
    setAddress,
    getAmountWithdrawable,
    getAppealCost,
    getArbitrationCost,
    getChallengeDeposit,
    getDisputeStatus,
    getReviewTimeout,
    getRewardPoolParams,
    getTranslatorDeposit,
    createTask,
    assignTask,
    acceptTranslation,
    challengeTranslation,
    submitTranslation,
    submitEvidence,
    fundAppeal,
    reimburseRequester,
    withdrawAllFeesAndRewards,
  };
};

const LinguoInteraction = {
  acceptTranslation: 'acceptTranslation',
  amountWithdrawable: 'amountWithdrawable',
  arbitrator: 'arbitrator',
  arbitratorExtraData: 'arbitratorExtraData',
  getChallengeValue: 'getChallengeValue',
  getDepositValue: 'getDepositValue',
  assignTask: 'assignTask',
  challengeTranslation: 'challengeTranslation',
  createTask: 'createTask',
  fundAppeal: 'fundAppeal',
  reviewTimeout: 'reviewTimeout',
  submitTranslation: 'submitTranslation',
  submitEvidence: 'submitEvidence',
  withdrawAllFeesAndRewards: 'batchRoundWithdraw',
};

const ArbitratorInteraction = {
  appealCost: 'appealCost',
  arbitrationCost: 'arbitrationCost',
  disputeStatus: 'disputeStatus',
};
