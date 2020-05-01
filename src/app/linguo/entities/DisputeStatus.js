/**
 * Dispute Status.
 *
 * Includes the representation from the smart contract,
 * plus a UI-only None status.
 *
 * @readonly
 * @enum {number}
 */
const DisputeStatus = {
  None: undefined,
  Waiting: 0,
  Appealable: 1,
  Solved: 2,
};

export default DisputeStatus;
