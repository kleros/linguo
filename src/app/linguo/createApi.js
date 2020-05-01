import dayjs from 'dayjs';
import Web3 from 'web3';
import ipfs from '~/app/ipfs';
import metaEvidenteTemplate from '~/assets/fixtures/metaEvidenceTemplate.json';
import createError from '~/utils/createError';
import { normalize } from './entities/Task';

const { toWei, toBN } = Web3.utils;

export const getFileUrl = path => {
  return ipfs.generateUrl(path);
};

export const publishMetaEvidence = async ({ account, ...metadata }) => {
  const metaEvidence = {
    ...metaEvidenteTemplate,
    aliases: {
      [account]: 'Requester',
    },
    metadata,
  };

  const { path } = await ipfs.publish('linguo-evidence.json', JSON.stringify(metaEvidence));

  return path;
};

export const fetchMetaEvidenceFromEvents = async ({ ID, events }) => {
  // There should be one and only one event
  const [event] = events;
  if (!event) {
    throw new Error(`No MetaEvidence event found for task ${ID}`);
  }

  const { _evidence: path } = event.returnValues;
  if (!path) {
    throw new Error(`No evidence file found for task ${ID}`);
  }

  const url = getFileUrl(path);

  try {
    const response = await fetch(url);
    return response.json();
  } catch (err) {
    throw createError(`Failed to fetch evidence for task ${ID}`, { cause: err });
  }
};

let id = 0;
export default function createApi({ linguoContract, arbitratorContract }) {
  async function getTaskById({ ID }) {
    /**
     * For some reason, event filtering breaks when ID is 0.
     * It returns all events occurrences of the specific event.
     * Casting it to string seems to solve the problem.
     */
    ID = String(ID);

    try {
      const [
        reviewTimeout,
        task,
        taskParties,
        metaEvidenceEvents,
        taskCreatedEvents,
        taskAssignedEvents,
        translationSubmittedEvents,
        translationChallengedEvents,
        taskResolvedEvents,
      ] = await Promise.all([
        linguoContract.methods.reviewTimeout().call(),
        linguoContract.methods.tasks(ID).call(),
        linguoContract.methods.getTaskParties(ID).call(),
        linguoContract.getPastEvents('MetaEvidence', {
          filter: { _metaEvidenceID: ID },
          fromBlock: 0,
        }),
        linguoContract.getPastEvents('TaskCreated', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        linguoContract.getPastEvents('TaskAssigned', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        linguoContract.getPastEvents('TranslationSubmitted', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        linguoContract.getPastEvents('TranslationChallenged', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        linguoContract.getPastEvents('TaskResolved', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
      ]);

      const [{ metadata }, disputeEvents] = await Promise.all([
        fetchMetaEvidenceFromEvents({ ID, events: metaEvidenceEvents }),
        linguoContract.getPastEvents('Dispute', {
          filter: { _disputeID: task.disputeID },
          fromBlock: 0,
        }),
      ]);

      const disputeStatus =
        disputeEvents.length > 0 ? await arbitratorContract.methods.disputeStatus(task.disputeID).call() : undefined;

      return normalize({
        ID,
        reviewTimeout,
        task: { ...task, parties: taskParties },
        metadata,
        disputeStatus,
        lifecycleEvents: {
          TaskCreated: taskCreatedEvents,
          TaskAssigned: taskAssignedEvents,
          TranslationSubmitted: translationSubmittedEvents,
          TranslationChallenged: translationChallengedEvents,
          TaskResolved: taskResolvedEvents,
          Dispute: disputeEvents,
        },
      });
    } catch (err) {
      console.error(err);
      throw createError(`Failed to fetch task with ID ${ID}`, { cause: err });
    }
  }

  async function getOwnTasks({ account }) {
    const events = await linguoContract.getPastEvents('TaskCreated', {
      filter: { _requester: account },
      fromBlock: 0,
    });

    const tasks = await Promise.all(
      events.map(async event => {
        const ID = event.returnValues._taskID;

        try {
          return await getTaskById({ ID });
        } catch (err) {
          return { ID, err };
        }
      })
    );

    return tasks;
  }

  async function getTaskPrice({ ID }) {
    try {
      return await linguoContract.methods.getTaskPrice(ID).call();
    } catch (err) {
      throw createError(`Failed to get price for task with ID ${ID}`, { cause: err });
    }
  }

  /**
   * The price for a translation task varies linearly with time
   * from `minPrice` to `maxPrice`, like the following chart:
   *
   *     Price A
   *           ┤
   *           ┤
   * maxPrice  ┤- - - - - - - -╭─x
   *           ┤            ╭──╯ |
   *           ┤          ╭─╯
   *           ┤        ╭─╯      |
   *           ┤     ╭──╯
   *           ┤   ╭─╯           |
   *           ┤ ╭─╯
   * minPrice  ┤x╯               |
   *           ┤
   *           ┤                 |
   *           ┤
   *           └+────────────────+──────────>
   *         created       deadline    Time
   *
   * This is a plot for the following price function:
   *
   *    p(t) = minPrice + (maxPrice - minPrice) * (t - creationTime) / submissionTimeout
   *
   * Because of that, the deposit required for the translator at the moment
   * he sends the transaction might be lower than the required value when
   * the transaction is mined.
   *
   * To cope with that, we try to predict what the deposit will be in Δt amount
   * of time from now (**with Δt being 1 hour by default.**).
   *
   * The actual required deposit depends on current price, but also on
   * arbitration cost (from the arbitrator contract) and `MULTIPLIER_DIVISOR`
   * (from linguo contract).
   *
   * Since `MULTIPLIER_DIVISOR` is a constant and the arbitration cost is
   * not expected to change too often, it is safe to adpot a linear function
   * as a proxy for the deposit. Its slope will the the same as the one from
   * the price function, which can be found with:
   *
   *    s = (maxPrice - minPrice) / submissionTimeout
   *
   * So if we get the current required deposit D, we can manage to get a
   * future value D' with:
   *
   *   D' = D + (s * Δt)
   *
   * This way we can be sure the deposited value is going to be safe for Δt time.
   *
   * Because the `assignTask` method on Linguo contract sends any surplus value
   * directly back to the sender, this has no impact in the amount the translator
   * has to lock in order to assign the task to himself if the transaction gets
   * mined before Δt has passed.
   */
  async function getTranslatorDeposit({ ID }, { timeDeltaInSeconds = 3600 } = {}) {
    let [deposit, { minPrice, maxPrice, submissionTimeout }] = await Promise.all([
      linguoContract.methods.getDepositValue(ID).call(),
      linguoContract.methods.tasks(ID).call(),
    ]);

    deposit = toBN(deposit);
    minPrice = toBN(minPrice);
    maxPrice = toBN(maxPrice);
    submissionTimeout = toBN(submissionTimeout);

    const slope = maxPrice.sub(minPrice).div(submissionTimeout);
    const timeDelta = toBN(String(timeDeltaInSeconds));

    return String(deposit.add(slope.mul(timeDelta)));
  }

  async function getChallengerDeposit({ ID }) {
    const deposit = await linguoContract.methods.getChallengeValue(ID).call();
    return deposit;
  }

  async function getTaskDisputeStatus({ ID }) {
    const { disputeID } = await linguoContract.methods.tasks(ID).call();
    const disputeEvents = await linguoContract.getPastEvents('Dispute', {
      filter: { _disputeID: disputeID },
      fromBlock: 0,
    });

    if (disputeEvents.length === 0) {
      throw new Error(`There is no dispute for task ${ID}`);
    }

    const disputeStatus = await arbitratorContract.methods.disputeStatus(disputeID).call();
    return Number(disputeStatus);
  }

  async function createTask(
    { account, deadline, minPrice, maxPrice, ...rest },
    { from = account, gas, gasPrice } = {}
  ) {
    minPrice = toWei(String(minPrice), 'ether');
    maxPrice = toWei(String(maxPrice), 'ether');
    deadline = dayjs(deadline).unix();

    const metaEvidence = await publishMetaEvidence({
      account,
      deadline,
      minPrice,
      maxPrice,
      ...rest,
    });

    try {
      const contractCall = linguoContract.methods.createTask(deadline, minPrice, metaEvidence);

      const txn = contractCall.send({
        from,
        gas,
        gasPrice,
        value: maxPrice,
      });

      const receipt = await txn;
      return receipt;
    } catch (err) {
      throw createError('Failed to create the translation task', { cause: err });
    }
  }

  async function assignTask({ ID }, { from, gas, gasPrice } = {}) {
    const value = await getTranslatorDeposit({ ID });
    const txn = linguoContract.methods.assignTask(ID).send({
      from,
      value,
      gas,
      gasPrice,
    });

    const receipt = await txn;
    return receipt;
  }

  async function submitTranslation({ ID, text }, { from, gas, gasPrice } = {}) {
    const txn = linguoContract.methods.submitTranslation(ID, text).send({
      from,
      gas,
      gasPrice,
    });

    const receipt = await txn;
    return receipt;
  }

  async function reimburseRequester({ ID }, { from, gas, gasPrice } = {}) {
    const txn = linguoContract.methods.reimburseRequester(ID).send({
      from,
      gas,
      gasPrice,
    });

    const receipt = await txn;
    return receipt;
  }

  async function acceptTranslation({ ID }, { from, gas, gasPrice } = {}) {
    const txn = linguoContract.methods.acceptTranslation(ID).send({
      from,
      gas,
      gasPrice,
    });

    const receipt = await txn;
    return receipt;
  }

  async function challengeTranslation({ ID }, { from, gas, gasPrice } = {}) {
    const value = await getChallengerDeposit({ ID });
    const txn = linguoContract.methods.challengeTranslation(ID).send({
      from,
      value,
      gas,
      gasPrice,
    });

    const receipt = await txn;
    return receipt;
  }

  return {
    id: ++id,
    getTaskById,
    getOwnTasks,
    getTaskPrice,
    getTranslatorDeposit,
    getChallengerDeposit,
    getTaskDisputeStatus,
    createTask,
    assignTask,
    submitTranslation,
    reimburseRequester,
    acceptTranslation,
    challengeTranslation,
  };
}
