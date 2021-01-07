const apiSkeleton = {
  createTask() {},
  // Methods below fetch multiple tasks
  getRequesterTasks() {},
  getTranslatorTasks() {},
  // Methods below interact with a single task
  getTaskById() {},
  getTaskPrice() {},
  getTranslatorDeposit() {},
  getChallengerDeposit() {},
  getTaskDispute() {},
  getTaskDisputeEvidences() {},
  getWithdrawableAmount() {},
  getArbitrationCost() {},
  assignTask() {},
  submitTranslation() {},
  approveTranslation() {},
  reimburseRequester() {},
  acceptTranslation() {},
  challengeTranslation() {},
  fundAppeal() {},
  submitEvidence() {},
  withdrawAllFeesAndRewards() {},
  // Methods here require special treatment
  subscribe() {},
  subscribeToArbitrator() {},
};

export default function createApiPlaceholder() {
  return new Proxy(apiSkeleton, {
    get: (target, prop) => {
      if (target[prop]) {
        return new Proxy(target[prop], methodHandler);
      }
    },
  });
}
const methodHandler = {
  apply: (target, thisArg, argumentList) => {
    return methodPlaceholder(target.name, argumentList);
  },
};

const methodPlaceholder = async name => {
  throw new Error(`Linguo API not properly initialized. Called method '${name}'.`);
};
