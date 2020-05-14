import Web3 from 'web3';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import produce from 'immer';
import { percentage } from '~/adapters/bigNumber';
import TaskParty from './TaskParty';
import TaskStatus from './TaskStatus';
import DisputeStatus from './DisputeStatus';
import DisputeRuling from './DisputeRuling';

const { toBN, BN } = Web3.utils;

dayjs.extend(isBetween);

const NON_PAYABLE_VALUE = new BN(2n ** 256n - 1n).toString();

/**
 * @function
 *
 * @param {DisputeInput} dispute The draft info object
 * @param {Object} task The task object
 * @param {boolean} task.hasDispute Whether the task had a draft or not
 * @param {number} task.disputeID The task disputeID
 * @param {number} task.status The task status
 * @param {number} task.ruling The task status
 * @param {RewardPoolParamsInput} rewardPoolParams The reward pool cost params
 * @return {Dispute} The normalized draft
 */
export const normalize = (dispute, task, rewardPoolParams) => {
  if (!task.hasDispute) {
    return {
      ID: undefined,
      status: DisputeStatus.None,
      ruling: DisputeRuling.None,
      appealPeriod: {
        start: new Date(0),
        end: new Date(0),
      },
      appealCost: NON_PAYABLE_VALUE,
      rewardPool: {
        [TaskParty.Translator]: NON_PAYABLE_VALUE,
        [TaskParty.Challenger]: NON_PAYABLE_VALUE,
      },
    };
  }

  const ruling = normalizeRuling(dispute, task);
  const status = DisputeStatus.of(dispute.status);
  const appealCost = dispute.appealCost ?? NON_PAYABLE_VALUE;

  return {
    ID: Number(task.disputeID),
    status,
    ruling,
    appealPeriod: {
      start: dayjs.unix(dispute.appealPeriod?.start ?? 0).toDate(),
      end: dayjs.unix(dispute.appealPeriod?.end ?? 0).toDate(),
    },
    latestRound: normalizeRound(dispute.latestRound),
    appealCost,
    rewardPool: normalizeRewardPool({ status, ruling, appealCost }, rewardPoolParams),
  };
};

export const normalizeRuling = (dispute, task) => {
  const hasRuling = [DisputeStatus.Appealable, DisputeStatus.Solved].includes(DisputeStatus.of(dispute.status));

  if (!hasRuling) {
    return DisputeRuling.None;
  }

  const taskIsResolved = TaskStatus.of(task.status) === TaskStatus.Resolved;
  /**
   * Dispute ruling might have been overwriten if there is an appeal
   * and one of the parties did not receive enough funding.
   * In this case, the outcome of the draft is no the one from the arbitrator,
   * but the one that is stored in the task itself.
   */
  return taskIsResolved ? DisputeRuling.of(task.ruling) : DisputeRuling.of(dispute.ruling);
};

/**
 * @function
 *
 * @param {LatesRoundInput} latestRountInput The latest round input
 * @return LatestRound
 */
export const normalizeRound = ({ hasPaid, paidFees, feeRewards }) => {
  return {
    parties: {
      [TaskParty.Translator]: {
        hasPaid: hasPaid[TaskParty.Translator],
        paidFees: paidFees[TaskParty.Translator],
      },
      [TaskParty.Challenger]: {
        hasPaid: hasPaid[TaskParty.Challenger],
        paidFees: paidFees[TaskParty.Challenger],
      },
    },
    feeRewards,
  };
};

export const normalizeRewardPool = (dispute, rewardPoolParams) => {
  const ruling = DisputeRuling.of(dispute.ruling);
  const disputeStatus = DisputeStatus.of(dispute.status);

  if (disputeStatus !== DisputeStatus.Appealable) {
    return {
      [TaskParty.Translator]: NON_PAYABLE_VALUE,
      [TaskParty.Challenger]: NON_PAYABLE_VALUE,
    };
  }

  const appealCost = toBN(dispute.appealCost);
  const winnerStakeMultiplier = toBN(rewardPoolParams.winnerStakeMultiplier);
  const loserStakeMultiplier = toBN(rewardPoolParams.loserStakeMultiplier);
  const sharedStakeMultiplier = toBN(rewardPoolParams.sharedStakeMultiplier);
  const multiplierDivisor = toBN(rewardPoolParams.multiplierDivisor);
  const nonPayableValue = toBN(NON_PAYABLE_VALUE);

  /**
   * If there was no winner in the previous round, the arbitration cost is the
   * same for both parties and it is calculated using `sharedStakeMultiplier`.
   */
  if (ruling === DisputeRuling.RefuseToRule) {
    const rewardPool = BN.min(appealCost.mul(sharedStakeMultiplier).div(multiplierDivisor), nonPayableValue).toString();

    return {
      [TaskParty.Translator]: rewardPool,
      [TaskParty.Challenger]: rewardPool,
    };
  }

  const winnerAppealCost = BN.min(
    appealCost.mul(winnerStakeMultiplier).div(multiplierDivisor),
    nonPayableValue
  ).toString();
  const loserAppealCost = BN.min(
    appealCost.mul(loserStakeMultiplier).div(multiplierDivisor),
    nonPayableValue
  ).toString();

  return {
    [TaskParty.Translator]: ruling === DisputeRuling.TranslationApproved ? winnerAppealCost : loserAppealCost,
    [TaskParty.Challenger]: ruling === DisputeRuling.TranslationRejected ? winnerAppealCost : loserAppealCost,
  };
};

export const remainingTimeForAppeal = ({ status, ruling, appealPeriod }, { party, currentDate = new Date() } = {}) => {
  if (!isAppealable({ status })) {
    return 0;
  }

  const appealStartTime = dayjs(appealPeriod.start);
  const appealDeadline = dayjs(appealPeriod.end);

  const hasPartyWon = TaskParty.of(party) === DisputeRuling.of(ruling);
  const hasJurorsRefusedToRule = DisputeRuling.of(ruling) === DisputeRuling.RefuseToRule;

  if (hasPartyWon || hasJurorsRefusedToRule) {
    return Math.max(appealDeadline.diff(dayjs(currentDate), 'second'), 0);
  }

  const appealTimeoutInSeconds = appealDeadline.diff(appealStartTime, 'second');

  /**
   * Losing party has half of the time to fund his side on an appeal.
   */
  const losingPartyDeadline = appealStartTime.add(appealTimeoutInSeconds / 2, 'second');

  return Math.max(losingPartyDeadline.diff(dayjs(currentDate), 'second'), 0);
};

export const isAppealOngoing = (
  { status, ruling, latestRound },
  {
    remainingTime = {
      [TaskParty.Translator]: 0,
      [TaskParty.Challenger]: 0,
    },
  }
) => {
  if (!isAppealable({ status })) {
    return false;
  }

  ruling = DisputeRuling.of(ruling);

  if (!DisputeRuling.hasWinner(ruling)) {
    /**
     * If there is no winner, the appeal period is the same for both parties,
     * so no matter which one we check here, since both are the same.
     */
    return remainingTime[TaskParty.Translator] > 0;
  }

  const winner = ruling === DisputeRuling.TranslationApproved ? TaskParty.Translator : TaskParty.Challenger;
  const loser = ruling === DisputeRuling.TranslationApproved ? TaskParty.Challenger : TaskParty.Translator;

  const winnerRemainingTime = remainingTime[winner];
  const loserRemainingTime = remainingTime[loser];

  if (winnerRemainingTime <= 0) {
    return false;
  }

  if (winnerRemainingTime > 0 && loserRemainingTime > 0) {
    return true;
  }

  const hasWinnerPaidAppealFee = hasPaidAppealFee({ latestRound }, { party: winner });
  const hasLoserPaidAppealFee = hasPaidAppealFee({ latestRound }, { party: loser });

  return hasLoserPaidAppealFee && !hasWinnerPaidAppealFee;
};

export const expectedFinalRuling = ({ status, ruling, latestRound }, { appealIsOngoing }) => {
  status = DisputeStatus.of(status);
  ruling = DisputeRuling.of(ruling);

  if (status !== DisputeStatus.Appealable || appealIsOngoing) {
    return ruling;
  }

  const hasTranslatorPaidFees = hasPaidAppealFee({ latestRound }, { party: TaskParty.Translator });
  const hasChallengerPaidFees = hasPaidAppealFee({ latestRound }, { party: TaskParty.Challenger });

  /**
   * If both parties failed to pay the fees, the final ruling is the same
   */
  if (!hasTranslatorPaidFees && !hasChallengerPaidFees) {
    return ruling;
  }

  /**
   * If only the challenger has paid the fees, the translation should be rejected
   */
  if (!hasTranslatorPaidFees && hasChallengerPaidFees) {
    return DisputeRuling.TranslationWasRejected;
  }

  /**
   * If only the translator has paid the fees, the translation should be approved
   */
  if (!hasChallengerPaidFees && hasTranslatorPaidFees) {
    return DisputeRuling.TranslationApproved;
  }

  /**
   * This should not happen if the task data is normalized after reading from the smart contract.
   * This is only here for explicitness sake.
   */
  return DisputeRuling.None;
};

export const totalAppealCost = ({ appealCost, rewardPool }, { party }) => {
  party = TaskParty.of(party);

  if (![TaskParty.Translator, TaskParty.Challenger].includes(party)) {
    return NON_PAYABLE_VALUE;
  }

  appealCost = toBN(appealCost);
  rewardPool = toBN(rewardPool[party] ?? NON_PAYABLE_VALUE);

  return BN.min(appealCost.add(rewardPool), toBN(NON_PAYABLE_VALUE)).toString();
};

export const fundingROI = ({ appealCost, rewardPool }, { party }) => {
  party = TaskParty.of(party);

  if (![TaskParty.Translator, TaskParty.Challenger].includes(party)) {
    return 0;
  }

  const counterParty = party === TaskParty.Challenger ? TaskParty.Translator : TaskParty.Challenger;

  const partyTotalAppealCost = toBN(totalAppealCost({ appealCost, rewardPool }, { party }));
  const counterPartyTotalAppealCost = toBN(totalAppealCost({ appealCost, rewardPool }, { party: counterParty }));
  appealCost = toBN(appealCost);

  return percentage(counterPartyTotalAppealCost.sub(appealCost), partyTotalAppealCost);
};

export const hasAppealFundingStarted = ({ latestRound }, { party } = {}) => {
  return (latestRound?.parties?.[party]?.paidFees ?? '0') !== '0';
};

export const hasPaidAppealFee = ({ latestRound }, { party }) => {
  return latestRound?.parties?.[party]?.hasPaid === true;
};

export const paidFees = ({ latestRound }, { party }) => {
  return latestRound?.parties?.[party]?.paidFees;
};

export const disputeHasRuling = ({ status }) => {
  return [DisputeStatus.Appealable, DisputeStatus.Solved].includes(status);
};

export const isWaiting = ({ status }) => {
  return DisputeStatus.Waiting === status;
};

export const isAppealable = ({ status }) => {
  return DisputeStatus.Appealable === status;
};

export const isSolved = ({ status }) => {
  return DisputeStatus.Solved === status;
};

export const registerAppealFunding = (dispute, { deposit, party }) => {
  deposit = toBN(deposit);
  return produce(dispute, draft => {
    if (draft?.latestRound?.parties?.[party] === undefined) {
      return;
    }

    const totalRequiredFees = toBN(totalAppealCost(draft, { party }));
    const currentlyPaidFees = toBN(draft.latestRound.parties[party].paidFees ?? '0');
    const updatedPaidFees = currentlyPaidFees.add(deposit);

    draft.latestRound.parties[party].paidFees = String(updatedPaidFees);
    draft.latestRound.parties[party].hasPaid = updatedPaidFees.gte(totalRequiredFees);
  });
};

/**
 * @typedef {Object} RewardPoolParamsInput The arbitration cost parameters
 * @prop {string|BN} winnerStakeMultiplier The multiplier for the winner side
 * @prop {string|BN} loserStakeMultiplier The multiplier for loser side
 * @prop {string|BN} sharedStakeMultiplier The multiplier for when there is no winner to the draft
 * @prop {string|BN} multiplierDivisor The divisor for all multipliers.
 */

/**
 * @typedef {Object} DisputeInput The draft info input
 * @prop {string|number} status The draft status
 * @prop {string|number} ruling The draft current ruling
 * @prop {Object} appealPeriod The draft appeal period
 * @prop {string} appealPeriod.start The draft appeal period start as Unix timestamp
 * @prop {string} appealPeriod.end The draft appeal period end as Unix timestamp
 * @prop {string} appealCost The cost of the appeal
 * @prop {LatestRoundInput} latestRound The latest draft round
 */

/**
 * @typedef {Object} LatestRoundInput Tbe latest round input
 * @prop {[boolean, boolean, boolean]} hasPaid A tuple indicating whether each party has paid its fees
 * @prop {[string, string, string]} paidFees A tuple with the amount paid by each party
 * @prop {string} feeRewards The rewards for the winning side
 */

/**
 * @typedef {Object} LatestRound The latest round of a draft
 * @prop {Object} parties
 * @prop {Object} parties[TaskParty.Translator]
 * @prop {boolean} parties[TaskParty.Translator].hasPaid whether the translator side has fully paid its appeal fees
 * @prop {boolean} parties[TaskParty.Translator].paidFees the amount of fees paid to the side of the translator
 * @prop {Object} parties[TaskParty.Challenger]
 * @prop {boolean} parties[TaskParty.Challenger].hasPaid whether the challenger side has fully paid its appeal fees
 * @prop {boolean} parties[TaskParty.Challenger].paidFees the amount of fees paid to the side of the challenger
 * @prop {string} feeRewards The rewards for the winning side
 */

/**
 * @typedef {Object} Dispute The draft info parts
 * @prop {number} ID The draft ID
 * @prop {DisputeStatus} status The draft status
 * @prop {DisputeRuling} ruling The draft ruling
 * @prop {LatestRound} [latestRound] Information regarding the latest draft round
 * @prop {Object} appealPeriod The draft appeal period
 * @prop {Date} appealPeriod.start The draft appeal period start
 * @prop {Date} appealPeriod.end The draft appeal period end
 * @prop {string} appealCost The cost of the appeal
 * @prop {Object} rewardPool The arbitration cost for each party
 * @prop {string} rewardPool[TaskParty.Translator] The arbitration cost for translator
 * @prop {string} rewardPool[TaskParty.Challenger] The arbitration cost for challenger
 */
