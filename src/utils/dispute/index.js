import moment from 'moment';
import { BigNumber } from 'ethers';
import { DisputeStatus } from '~/features/disputes';
import { TaskParty } from '~/features/tasks';
import disputeRuling, { mapRulingToParty } from '~/consts/disputeRuling';
import { percentage } from '../percentage';

const NON_PAYABLE_VALUE = BigNumber.from(2).pow(256).sub(1);

const isAppealable = status => {
  return status === DisputeStatus.Appealable;
};
const isSolved = status => {
  return status === DisputeStatus.Solved;
};
const isWaiting = status => {
  return status === DisputeStatus.Waiting;
};
const isOtherPary = party => ![TaskParty.Translator, TaskParty.Challenger].includes(party);
const hasWinner = ruling => [disputeRuling.TranslationApproved, disputeRuling.TranslationRejected].includes(ruling);

const isAppealOngoing = (status, ruling, { remainingTime, hasPaidFees }) => {
  if (!isAppealable(status)) return false;
  if (!hasWinner(ruling)) {
    /**
     * If there is no winner, the appeal period is the same for both parties,
     * so no matter which one we check here, since both are the same.
     */
    return remainingTime[TaskParty.Translator] > 0;
  }
  const winner = ruling === disputeRuling.TranslationApproved ? TaskParty.Translator : TaskParty.Challenger;
  const loser = ruling === disputeRuling.TranslationApproved ? TaskParty.Challenger : TaskParty.Translator;

  const winnerRemainingTime = remainingTime[winner];
  const loserRemainingTime = remainingTime[loser];

  if (winnerRemainingTime <= 0) return false;
  if (winnerRemainingTime > 0 && loserRemainingTime > 0) return true;

  return hasPaidFees[loser] && !hasPaidFees[winner];
};

const getRemainingTimeForAppeal = (status, ruling, appealPeriodStart, appealPeriodEnd, party) => {
  if (!isAppealable(status)) return 0;

  const currentTime = moment();
  const appealStartTime = moment.unix(appealPeriodStart);
  const appealDeadline = moment.unix(appealPeriodEnd);

  const hasPartyWon = party === mapRulingToParty[ruling];
  const hasJurorsRefusedToRule = ruling === disputeRuling.RefuseToRule;

  if (hasPartyWon || hasJurorsRefusedToRule) {
    return Math.max(appealDeadline.subtract(currentTime).unix(), 0);
  }

  const appealTimeout = appealDeadline.subtract(appealStartTime);
  const losingPartyDeadline = appealStartTime.add(appealTimeout / 2);
  const remainingTime = losingPartyDeadline.subtract(currentTime);

  return Math.max(remainingTime.unix(), 0);
};

const getRewardPool = (status, ruling, appealCost, rewardPoolParams) => {
  if (!isAppealable(status)) {
    return {
      [TaskParty.Translator]: NON_PAYABLE_VALUE.toString(),
      [TaskParty.Challenger]: NON_PAYABLE_VALUE.toString(),
    };
  }
  appealCost = BigNumber.from(appealCost);
  const winnerStakeMultiplier = BigNumber.from(rewardPoolParams.winnerStakeMultiplier);
  const loserStakeMultiplier = BigNumber.from(rewardPoolParams.loserStakeMultiplier);
  const sharedStakeMultiplier = BigNumber.from(rewardPoolParams.sharedStakeMultiplier);
  const multiplierDivisor = BigNumber.from(rewardPoolParams.multiplierDivisor);

  /**
   * If there was no winner in the previous round, the arbitration cost is the
   * same for both parties and it is calculated using `sharedStakeMultiplier`.
   */
  if (ruling === disputeRuling.RefuseToRule) {
    const reward = _min(appealCost.mul(sharedStakeMultiplier).div(multiplierDivisor), NON_PAYABLE_VALUE).toString();
    return {
      [TaskParty.Translator]: reward,
      [TaskParty.Challenger]: reward,
    };
  }
  const winnerAppealCost = _min(
    appealCost.mul(winnerStakeMultiplier).div(multiplierDivisor),
    NON_PAYABLE_VALUE
  ).toString();

  const loserAppealCost = _min(
    appealCost.mul(loserStakeMultiplier).div(multiplierDivisor),
    NON_PAYABLE_VALUE
  ).toString();

  return {
    [TaskParty.Translator]: ruling === disputeRuling.TranslationApproved ? winnerAppealCost : loserAppealCost,
    [TaskParty.Challenger]: ruling === disputeRuling.TranslationRejected ? winnerAppealCost : loserAppealCost,
  };
};

const _min = (value1, value2) => {
  if (value1 instanceof BigNumber) {
    return value1.lt(value2) ? value1 : value2;
  }
  return value1 < value2 ? value1 : value2;
};

const getTotalAppealCost = (appealCost, rewardPool, party) => {
  if (!appealCost) return;

  if (isOtherPary(party)) return NON_PAYABLE_VALUE.toString();

  appealCost = BigNumber.from(appealCost);
  const reward = BigNumber.from(rewardPool[party]) ?? NON_PAYABLE_VALUE;

  return _min(appealCost.add(reward), NON_PAYABLE_VALUE).toString();
};

const getFundingROI = (appealCost, rewardPool, party) => {
  if (!appealCost) return;

  if (isOtherPary(party)) return 0; // ZERO.toString();

  const counterParty = party === TaskParty.Challenger ? TaskParty.Translator : TaskParty.Challenger;

  const partyTotalAppealCost = BigNumber.from(getTotalAppealCost(appealCost, rewardPool, party));
  const counterPartyTotalAppealCost = BigNumber.from(getTotalAppealCost(appealCost, rewardPool, counterParty));
  appealCost = BigNumber.from(appealCost);

  return percentage(counterPartyTotalAppealCost.sub(appealCost), partyTotalAppealCost);
};

const getExpectedFinalRuling = (status, ruling, isAppealOngoing, hasPaidFees) => {
  if (status !== DisputeStatus.Appealable || isAppealOngoing) {
    return ruling;
  }

  if (!hasPaidFees[TaskParty.Translator] && !hasPaidFees[TaskParty.Challenger]) {
    return ruling;
  }

  if (!hasPaidFees[TaskParty.Translator] && hasPaidFees[TaskParty]) {
    return disputeRuling.TranslationWasRejected;
  }

  if (!hasPaidFees[TaskParty.Challenger] && hasPaidFees[TaskParty.Translator]) {
    return disputeRuling.TranslationApproved;
  }
};

const isWithinAppealPeriod = (appealPeriodStart, appealPeriodEnd) => {
  const currentTime = moment();
  appealPeriodStart = moment(appealPeriodStart);
  appealPeriodEnd = moment(appealPeriodEnd);
  return currentTime.isBetween(appealPeriodStart, appealPeriodEnd);
};

const Dispute = {
  isSolved,
  isWaiting,
  isAppealable,
  isAppealOngoing,
  isWithinAppealPeriod,
  getExpectedFinalRuling,
  getFundingROI,
  getRemainingTimeForAppeal,
  getRewardPool,
  getTotalAppealCost,
};
export default Dispute;
