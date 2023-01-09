const disputeRuling = Object.freeze({
  None: undefined,
  RefuseToRule: 'None',
  TranslationApproved: 'Approve',
  TranslationRejected: 'Reject',
});

export default disputeRuling;

export const mapRulingToParty = {
  [disputeRuling.None]: 0,
  [disputeRuling.RefuseToRule]: 0,
  [disputeRuling.TranslationApproved]: 1,
  [disputeRuling.TranslationRejected]: 2,
};
