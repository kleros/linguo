import { useCallback, useMemo } from 'react';
import { useRoundQuery } from './queries/useRoundQuery';
import { useLinguoApi } from './useLinguo';

import Dispute from '~/utils/dispute';
import { TaskParty } from '~/features/tasks';

export const useDispute = (id, roundId) => {
  const { round, isLoading, error } = useRoundQuery(roundId);
  const { getDisputeStatus, getAppealCost, getRewardPoolParams } = useLinguoApi();

  const status = getDisputeStatus(id);
  const appealCost = getAppealCost(id);
  const rewardPoolParams = getRewardPoolParams();

  const isWaiting = useMemo(() => {
    if (status !== undefined) return Dispute.isWaiting(status);
  }, [status]);

  const isSolved = useMemo(() => {
    if (status !== undefined) return Dispute.isSolved(status);
  }, [status]);

  const isAppealable = useMemo(() => {
    if (status !== undefined) return Dispute.isAppealable(status);
  }, [status]);

  const remainingTimeForTranslator = useMemo(() => {
    if (status !== undefined)
      return Dispute.getRemainingTimeForAppeal(
        status,
        round.ruling,
        round.appealPeriodStart,
        round.appealPeriodEnd,
        TaskParty.Translator
      );
  }, [round?.appealPeriodEnd, round?.appealPeriodStart, round?.ruling, status]);

  const remainingTimeForChallenger = useMemo(() => {
    if (status !== undefined) {
      return Dispute.getRemainingTimeForAppeal(
        status,
        round.ruling,
        round.appealPeriodStart,
        round.appealPeriodEnd,
        TaskParty.Challenger
      );
    }
  }, [round?.appealPeriodEnd, round?.appealPeriodStart, round?.ruling, status]);

  const isAppealOngoing = useMemo(() => {
    if (status !== undefined)
      return Dispute.isAppealOngoing(status, round.ruling, {
        remainingTime: {
          [TaskParty.Translator]: remainingTimeForTranslator,
          [TaskParty.Challenger]: remainingTimeForChallenger,
        },
        hasPaidFees: {
          [TaskParty.Translator]: round.hasPaidTranslator,
          [TaskParty.Challenger]: round.hasPaidChallenger,
        },
      });
  }, [
    status,
    round?.ruling,
    round?.hasPaidTranslator,
    round?.hasPaidChallenger,
    remainingTimeForTranslator,
    remainingTimeForChallenger,
  ]);

  const rewardPool = useMemo(() => {
    if (status !== undefined && appealCost !== undefined) {
      return Dispute.getRewardPool(status, round.ruling, appealCost, rewardPoolParams);
    }
  }, [appealCost, rewardPoolParams, round?.ruling, status]);

  const totalAppealCost = useCallback(
    party => appealCost && Dispute.getTotalAppealCost(appealCost, rewardPool, party),
    [appealCost, rewardPool]
  );
  const fundingROI = party => Dispute.getFundingROI(appealCost, rewardPool, party);

  const expectedFinalRuling = useMemo(() => {
    if (status !== undefined) {
      return Dispute.getExpectedFinalRuling(status, round.ruling, isAppealOngoing, {
        hasPaidFees: {
          [TaskParty.Translator]: round.hasPaidTranlator,
          [TaskParty.Challenger]: round.hasPaidChallenger,
        },
      });
    }
  }, [isAppealOngoing, round?.hasPaidChallenger, round?.hasPaidTranlator, round?.ruling, status]);

  return {
    dispute: {
      ...round,
      appealCost,
      expectedFinalRuling,
      fundingROI,
      isAppealable,
      isAppealOngoing,
      isSolved,
      isWaiting,
      remainingTimeForChallenger,
      remainingTimeForTranslator,
      status,
      totalAppealCost,
    },
    isLoading: isLoading || status === undefined,
    error,
  };
};
