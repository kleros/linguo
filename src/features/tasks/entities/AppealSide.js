import Enum from './utils/Enum';
import TaskParty from './TaskParty';
import DisputeRuling from './DisputeRuling';

/**
 * This enum is used for UI purposes only.
 *
 * @readonly
 * @enum {string} The appeal side
 */
const AppealSide = Enum('AppealSide', {
  Winner: 'winner',
  Loser: 'loser',
  Tie: 'tie',
  None: undefined,
});

Object.defineProperty(AppealSide, 'fromRulingAndParty', {
  enumerable: false,
  value: ({ ruling, party }) => {
    ruling = DisputeRuling.of(ruling);
    party = TaskParty.of(party);

    if (![TaskParty.Translator, TaskParty.Challenger].includes(party)) {
      return AppealSide.None;
    }

    if (ruling === DisputeRuling.RefuseToRule) {
      return AppealSide.Tie;
    }

    if (party === TaskParty.Translator) {
      return ruling === DisputeRuling.TranslationApproved ? AppealSide.Winner : AppealSide.Loser;
    }

    if (party === TaskParty.Challenger) {
      return ruling === DisputeRuling.TranslationApproved ? AppealSide.Loser : AppealSide.Winner;
    }
  },
});

export default AppealSide;
