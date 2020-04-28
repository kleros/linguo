/**
 * IMPORTANT: this is NOT a 1:1 map to Task.parties on linguo contract.
 * Task.parties is related to the parties of a dispute created on Kleros Court,
 * which will be the Translator and the Challenger.
 *
 * This enum is used for UI purposes only.
 *
 * @readonly
 * @enum {string} The task party
 */
const TaskParty = {
  Requester: 'requester',
  Translator: 'translator',
  Challenger: 'challenger',
  Other: 'other',
};

export { TaskParty as default };
