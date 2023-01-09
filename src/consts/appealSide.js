import { TaskParty } from '~/features/tasks';
import disputeRuling from './disputeRuling';

const AppealSide = Object.freeze({
  Winner: 'winner',
  Loser: 'loser',
  Tie: 'tie',
  None: undefined,
});

const rulingToAppealSideMap = {
  [disputeRuling.TranslationApproved]: {
    [TaskParty.Translator]: AppealSide.Winner,
    [TaskParty.Challenger]: AppealSide.Loser,
  },
  [disputeRuling.TranslationRejected]: {
    [TaskParty.Translator]: AppealSide.Loser,
    [TaskParty.Challenger]: AppealSide.Winner,
  },
  [disputeRuling.RefuseToRule]: AppealSide.Tie,
};

export const mapRulingAndPartyToAppealSide = (ruling, party) => {
  if (![TaskParty.Translator, TaskParty.Challenger].includes(party)) {
    return AppealSide.None;
  }
  return rulingToAppealSideMap[ruling][party] || AppealSide.None;
};

export default AppealSide;
