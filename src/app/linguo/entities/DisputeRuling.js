/**
 * Dispute Ruling.
 *
 * Includes the representation from the smart contract,
 * plus a UI-only None status.
 *
 * @readonly
 * @enum {number}
 */
const DisputeRuling = {
  None: undefined,
  RefuseToRule: 0,
  TranslatorWins: 1,
  ChallengerWins: 2,
};

export default DisputeRuling;
