import React from 'react';
import { Dispute, AppealSide, TaskParty } from '~/app/linguo';
import { useRemainingTime } from '~/components/RemainingTime';
import DisputeContext from '../DisputeContext';

export default function useAppealStatus() {
  const dispute = React.useContext(DisputeContext);

  const currentDate = new Date();

  const remainingTimeForTranslator = useRemainingTime(
    Dispute.remainingTimeForAppeal(dispute, {
      currentDate,
      party: TaskParty.Translator,
    })
  );
  const remainingTimeForChallenger = useRemainingTime(
    Dispute.remainingTimeForAppeal(dispute, {
      currentDate,
      party: TaskParty.Challenger,
    })
  );

  const appealIsOngoing = Dispute.isAppealOngoing(dispute, {
    remainingTime: {
      [TaskParty.Translator]: remainingTimeForTranslator,
      [TaskParty.Challenger]: remainingTimeForChallenger,
    },
  });

  const parties = {
    [TaskParty.Translator]: {
      remainingTime: remainingTimeForTranslator,
      appealSide: AppealSide.fromRulingAndParty({
        ruling: dispute.ruling,
        party: TaskParty.Translator,
      }),
      finalAppealSide: AppealSide.fromRulingAndParty({
        ruling: Dispute.expectedFinalRuling(dispute, { appealIsOngoing }),
        party: TaskParty.Translator,
      }),
      paidFees: Dispute.paidFees(dispute, { party: TaskParty.Translator }),
      hasPaidFee: Dispute.hasPaidAppealFee(dispute, { party: TaskParty.Translator }),
      totalAppealCost: Dispute.totalAppealCost(dispute, { party: TaskParty.Challenger }),
      reward: Dispute.fundingROI(dispute, { party: TaskParty.Translator }),
    },
    [TaskParty.Challenger]: {
      remainingTime: remainingTimeForChallenger,
      appealSide: AppealSide.fromRulingAndParty({
        ruling: dispute.ruling,
        party: TaskParty.Challenger,
      }),
      finalAppealSide: AppealSide.fromRulingAndParty({
        ruling: Dispute.expectedFinalRuling(dispute, { appealIsOngoing }),
        party: TaskParty.Challenger,
      }),
      paidFees: Dispute.paidFees(dispute, { party: TaskParty.Challenger }),
      hasPaidFee: Dispute.hasPaidAppealFee(dispute, { party: TaskParty.Challenger }),
      totalAppealCost: Dispute.totalAppealCost(dispute, { party: TaskParty.Challenger }),
      reward: Dispute.fundingROI(dispute, { party: TaskParty.Challenger }),
    },
  };

  return {
    parties,
    isOngoing: appealIsOngoing,
  };
}
