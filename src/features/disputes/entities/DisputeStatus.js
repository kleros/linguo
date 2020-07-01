import { Enum } from '~/features/shared/entities/utils';

/**
 * Dispute Status.
 *
 * Includes the representation from the smart contract,
 * plus a UI-only None status.
 *
 * @readonly
 * @enum {number}
 */
const DisputeStatus = Enum(
  'DisputeStatus',
  {
    None: undefined,
    Waiting: 0,
    Appealable: 1,
    Solved: 2,
  },
  {
    parseValue: v => (v === undefined ? v : Number.parseInt(v, 10)),
  }
);

export default DisputeStatus;
