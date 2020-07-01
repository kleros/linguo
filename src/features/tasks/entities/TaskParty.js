import { Enum } from '~/features/shared/entities/utils';

/**
 * IMPORTANT: this is NOT a 1:1 map to Task.parties on linguo contract.
 * Task.parties is related to the parties of a dispute created on Kleros Court,
 * which will be the Translator and the Challenger.
 *
 * This enum is used for UI purposes only. That's why `Requester` and `Other`
 * are represented as negative numbers.
 *
 * @readonly
 * @enum {number} The task party
 */
const TaskParty = Enum(
  'TaskParty',
  {
    Translator: 1,
    Challenger: 2,
    Requester: -10,
    Other: -20,
  },
  {
    parseValue: v => Number.parseInt(v, 10),
  }
);

export default TaskParty;
