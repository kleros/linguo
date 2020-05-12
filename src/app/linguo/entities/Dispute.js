import Web3 from 'web3';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import produce from 'immer';
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
 * @param {ArbitrationCostParamsInput} arbitrationCostParams The arbitration cost params
 * @return {Dispute} The normalized draft
 */
export const normalize = (dispute, task, arbitrationCostParams) => {
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
      arbitrationCost: {
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
    arbitrationCost: normalizeArbitrationCost({ status, ruling, appealCost }, arbitrationCostParams),
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

export const normalizeArbitrationCost = (dispute, arbitrationCostParams) => {
  const ruling = DisputeRuling.of(dispute.ruling);
  const disputeStatus = DisputeStatus.of(dispute.status);

  if (disputeStatus !== DisputeStatus.Appealable) {
    return {
      [TaskParty.Translator]: NON_PAYABLE_VALUE,
      [TaskParty.Challenger]: NON_PAYABLE_VALUE,
    };
  }

  const appealCost = toBN(dispute.appealCost);
  const winnerStakeMultiplier = toBN(arbitrationCostParams.winnerStakeMultiplier);
  const loserStakeMultiplier = toBN(arbitrationCostParams.loserStakeMultiplier);
  const sharedStakeMultiplier = toBN(arbitrationCostParams.sharedStakeMultiplier);
  const multiplierDivisor = toBN(arbitrationCostParams.multiplierDivisor);
  const nonPayableValue = toBN(NON_PAYABLE_VALUE);

  /**
   * If there was no winner in the previous round, the arbitration cost is the
   * same for both parties and it is calculated using `sharedStakeMultiplier`.
   */
  if (ruling === DisputeRuling.RefuseToRule) {
    const arbitrationCost = BN.min(
      appealCost.mul(sharedStakeMultiplier).div(multiplierDivisor),
      nonPayableValue
    ).toString();

    return {
      [TaskParty.Translator]: arbitrationCost,
      [TaskParty.Challenger]: arbitrationCost,
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

export const totalAppealCost = ({ appealCost, arbitrationCost }, { party }) => {
  party = TaskParty.of(party);

  if (![TaskParty.Translator, TaskParty.Challenger].includes(party)) {
    return NON_PAYABLE_VALUE;
  }

  appealCost = toBN(appealCost);
  arbitrationCost = toBN(arbitrationCost[party] ?? NON_PAYABLE_VALUE);

  return BN.min(appealCost.add(arbitrationCost), toBN(NON_PAYABLE_VALUE)).toString();
};

export const hasAppealFundingStarted = ({ latestRound }, { party } = {}) => {
  return (latestRound?.parties?.[party]?.paidFees ?? '0') !== '0';
};

export const isWithinAppealPeriod = ({ ruling, appealPeriod, ...rest }, { currentDate = new Date() } = {}) => {
  ruling = DisputeRuling.of(ruling);

  if (ruling === DisputeRuling.RefuseToRule) {
    const start = dayjs(appealPeriod?.start ?? 0);
    const end = dayjs(appealPeriod?.end ?? 0);

    return dayjs(currentDate).isBetween(start, end, 'second');
  }

  const loserParty = ruling === DisputeRuling.TranslationApproved ? TaskParty.Challenger : TaskParty.Translator;
  const remainingTime = remainingTimeForAppeal({ ruling, appealPeriod, ...rest }, { party: loserParty, currentDate });

  return remainingTime > 0;
};

export const hasPaidAppealFee = ({ latestRound }, { party }) => {
  return latestRound?.hasPaid?.[party] === true;
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
 * @typedef {Object} ArbitrationCostParamsInput The arbitration cost parameters
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
 * @prop {Object} arbitrationCost The arbitration cost for each party
 * @prop {string} arbitrationCost[TaskParty.Translator] The arbitration cost for translator
 * @prop {string} arbitrationCost[TaskParty.Challenger] The arbitration cost for challenger
 */
