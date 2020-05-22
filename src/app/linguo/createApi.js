import dayjs from 'dayjs';
import Web3 from 'web3';
import deepMerge from 'deepmerge';
import ipfs from '~/app/ipfs';
import metaEvidenceTemplate from '~/assets/fixtures/metaEvidenceTemplate.json';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import { normalize as normalizeTask } from './entities/Task';
import { normalize as normalizeDispute } from './entities/Dispute';

const { toWei, toBN } = Web3.utils;

// 2**256 - 1
const NON_PAYABLE_VALUE = toBN('2').pow(toBN('256')).sub(toBN('1')).toString();

export const getFileUrl = path => {
  return ipfs.generateUrl(path);
};

export const publishMetaEvidence = async ({ account, ...metadata }) => {
  const metaEvidence = deepMerge(metaEvidenceTemplate, {
    aliases: {
      [account]: 'Requester',
    },
    metadata,
  });

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
    console.warn(`Failed to fetch evidence for task ${ID}`, err);
    throw new Error(`Failed to fetch evidence for task ${ID}`);
  }
};

const onlyIfMatchingLanguageSkills = languageSkills => ({ sourceLanguage, targetLanguage, expectedQuality }) => {
  /**
   * Z1 level does not exist for any language, so we are just using this as
   * a fallback in case we find an unexpected value for `expectedQuality`.
   * In this case, since the task is non-standard, it should not be shown
   * to a translator.
   */
  const requiredLevel = translationQualityTiers[expectedQuality]?.requiredLevel ?? 'Z1';
  const satisfiesSource = languageSkills.some(
    skill => skill.language === sourceLanguage && skill.level >= requiredLevel
  );
  const satisfiesTarget = languageSkills.some(
    skill => skill.language === targetLanguage && skill.level >= requiredLevel
  );

  return satisfiesSource && satisfiesTarget;
};

let id = 0;

export default function createApi({ web3, linguoContract, arbitratorContract }) {
  async function getRequesterTasks({ account }) {
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

  async function getTranslatorTasks({ account, languageSkills }) {
    languageSkills = typeof languageSkills === 'string' ? JSON.parse(languageSkills) : languageSkills;

    const currentBlockNumber = await web3.eth.getBlockNumber();

    const unassignedTaskIDs = await _getUnassignedTaskIDs({
      languageSkills,
      currentBlockNumber,
    });

    const inReviewTaskIDs = await _getInReviewTaskIDs({
      languageSkills,
      currentBlockNumber,
    });

    const taskIDsAssignedToAccount = await _getTaskIDsFromEvent('TaskAssigned', {
      fromBlock: 0,
      filter: { _translator: account },
    });
    const taskIDsChallengedByAccount = await _getTaskIDsFromEvent('TranslationChallenged', {
      fromBlock: 0,
      filter: { _challenger: account },
    });

    const uniqueTaskIDs = [
      ...new Set([
        ...unassignedTaskIDs,
        ...inReviewTaskIDs,
        ...taskIDsAssignedToAccount,
        ...taskIDsChallengedByAccount,
      ]),
    ];

    const tasks = await Promise.all(
      uniqueTaskIDs.map(async ID => {
        try {
          return await getTaskById({ ID });
        } catch (err) {
          return { ID, err };
        }
      })
    );

    return tasks;
  }

  async function _getUnassignedTaskIDs({ currentBlockNumber, languageSkills }) {
    /**
     * We are going back ~60 days (considering ~4 blocks / minute)
     */
    const unassingedRelevantBlocks = 345600;
    const fromBlock = currentBlockNumber - unassingedRelevantBlocks;

    const created = await _getTaskIDsFromEvent('TaskCreated', { fromBlock });
    const assigned = await _getTaskIDsFromEvent('TaskAssigned', { fromBlock });
    const resolved = await _getTaskIDsFromEvent('TaskResolved', { fromBlock });

    const unassignedTaskIDs = created.filter(ID => !assigned.includes(ID) && !resolved.includes(ID));

    if (!Array.isArray(languageSkills)) {
      return unassignedTaskIDs;
    }

    const unassignedTasksMetadata = await Promise.all(unassignedTaskIDs.map(ID => _getTaskMetadata({ ID })));

    return unassignedTasksMetadata.filter(onlyIfMatchingLanguageSkills(languageSkills)).map(({ ID }) => ID);
  }

  async function _getInReviewTaskIDs({ currentBlockNumber, languageSkills }) {
    const reviewTimeout = await linguoContract.methods.reviewTimeout().call();

    /**
     * We are adding 20% to the `reviewTimeout` to cope with fluctuations
     * in the 15s per block mining period if review timeout is small
     */
    const relevantBlocksCount = Math.round((Number(reviewTimeout) * 1.2) / 15);
    const fromBlock = currentBlockNumber - relevantBlocksCount;

    const taskIDsInReview = await _getTaskIDsFromEvent('TranslationSubmitted', { fromBlock });

    const tasksInReviewMetadata = await Promise.all(taskIDsInReview.map(ID => _getTaskMetadata({ ID })));

    if (!Array.isArray(languageSkills)) {
      return taskIDsInReview;
    }

    return tasksInReviewMetadata.filter(onlyIfMatchingLanguageSkills(languageSkills)).map(({ ID }) => ID);
  }

  async function _getTaskIDsFromEvent(eventName, { fromBlock, toBlock, filter }) {
    const events = await linguoContract.getPastEvents(eventName, {
      fromBlock,
      toBlock,
      filter,
    });

    return events.map(({ returnValues }) => returnValues._taskID);
  }

  async function getTaskById({ ID }) {
    /**
     * For some reason, event filtering breaks when ID is 0.
     * It returns all events occurrences of the specific event.
     * Casting it to string seems to solve the problem.
     */
    ID = String(ID);

    try {
      const [reviewTimeout, task, taskParties] = await Promise.all([
        linguoContract.methods.reviewTimeout().call(),
        linguoContract.methods.tasks(ID).call(),
        linguoContract.methods.getTaskParties(ID).call(),
      ]);

      const taskCreatedEvents = await linguoContract.getPastEvents('TaskCreated', {
        filter: { _taskID: ID },
        fromBlock: 0,
      });
      const taskAssignedEvents = await linguoContract.getPastEvents('TaskAssigned', {
        filter: { _taskID: ID },
        fromBlock: 0,
      });
      const translationSubmittedEvents = await linguoContract.getPastEvents('TranslationSubmitted', {
        filter: { _taskID: ID },
        fromBlock: 0,
      });
      const translationChallengedEvents = await linguoContract.getPastEvents('TranslationChallenged', {
        filter: { _taskID: ID },
        fromBlock: 0,
      });
      const taskResolvedEvents = await linguoContract.getPastEvents('TaskResolved', {
        filter: { _taskID: ID },
        fromBlock: 0,
      });
      const metadata = await _getTaskMetadata({ ID });

      const disputeEvents =
        translationChallengedEvents.length > 0
          ? await linguoContract.getPastEvents('Dispute', {
              filter: { _disputeID: task.disputeID },
              fromBlock: 0,
            })
          : [];

      return normalizeTask({
        ID,
        reviewTimeout,
        task: { ...task, parties: taskParties },
        metadata,
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
      console.warn(`Failed to fetch task with ID ${ID}`, err);
      throw new Error(`Failed to fetch task with ID ${ID}`);
    }
  }

  async function _getTaskMetadata({ ID }) {
    ID = String(ID);

    const metaEvidenceEvents = await linguoContract.getPastEvents('MetaEvidence', {
      filter: { _metaEvidenceID: ID },
      fromBlock: 0,
    });
    const { metadata } = await fetchMetaEvidenceFromEvents({
      ID,
      events: metaEvidenceEvents,
    });

    return { ID, ...metadata };
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
  async function getTaskPrice({ ID }) {
    try {
      return await linguoContract.methods.getTaskPrice(ID).call();
    } catch (err) {
      console.warn(`Failed to get price for task with ID ${ID}`, err);
      throw new Error(`Failed to get price for task with ID ${ID}`);
    }
  }

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

  async function getTaskDispute({ ID }) {
    const [{ task, dispute }, latestRound, rewardPoolParams] = await Promise.all([
      _getTaskAndDisputeDetails({ ID }),
      _getLatestTaskRound({ ID }),
      _getRewardPoolParams(),
    ]);

    const aggregateDispute = {
      ...dispute,
      latestRound,
    };

    return normalizeDispute(aggregateDispute, task, rewardPoolParams);
  }

  async function _getTaskAndDisputeDetails({ ID }) {
    const task = await linguoContract.methods.tasks(ID).call();
    const { disputeID } = task;

    const [disputeInfo, appealPeriod, appealCost] = await Promise.all([
      _getDisputeRulingAndStatus({ disputeID }),
      _getAppealPeriod({ disputeID }),
      _getAppealCost({ disputeID }),
    ]);

    const { hasDispute, status, ruling } = disputeInfo;
    const dispute = { status, ruling, appealPeriod, appealCost };

    return {
      task: {
        ...task,
        hasDispute,
      },
      dispute,
    };
  }

  async function _getDisputeRulingAndStatus({ disputeID }) {
    const disputeEvents = await linguoContract.getPastEvents('Dispute', {
      filter: { _disputeID: disputeID },
      fromBlock: 0,
    });

    const hasDispute = disputeEvents.length > 0;

    if (!hasDispute) {
      return {
        hasDispute: false,
      };
    }

    try {
      const [status, ruling] = await Promise.all([
        arbitratorContract.methods.disputeStatus(disputeID).call(),
        arbitratorContract.methods.currentRuling(disputeID).call(),
      ]);
      return {
        hasDispute: true,
        status,
        ruling,
      };
    } catch (err) {
      if (!/VM execution error/i.test(err.message)) {
        console.warn('Could not get dispute info', err);
      }
      return {
        hasDispute: false,
      };
    }
  }

  async function _getAppealPeriod({ disputeID }) {
    try {
      return await arbitratorContract.methods.appealPeriod(disputeID).call();
    } catch (err) {
      if (!/VM execution error/i.test(err.message)) {
        console.warn('Could not get dispute appeal period', err);
      }
      return {
        start: '0',
        end: '0',
      };
    }
  }

  async function _getAppealCost({ disputeID }) {
    try {
      return await arbitratorContract.methods.appealCost(disputeID, '0x0').call();
    } catch (err) {
      if (!/VM execution error/i.test(err.message)) {
        console.warn('Could not get dispute appeal cost', err);
      }
      return NON_PAYABLE_VALUE;
    }
  }

  async function _getRewardPoolParams() {
    const [winnerStakeMultiplier, loserStakeMultiplier, sharedStakeMultiplier, multiplierDivisor] = await Promise.all([
      linguoContract.methods.winnerStakeMultiplier().call(),
      linguoContract.methods.loserStakeMultiplier().call(),
      linguoContract.methods.sharedStakeMultiplier().call(),
      linguoContract.methods.MULTIPLIER_DIVISOR().call(),
    ]);

    return {
      winnerStakeMultiplier,
      loserStakeMultiplier,
      sharedStakeMultiplier,
      multiplierDivisor,
    };
  }

  async function _getLatestTaskRound({ ID }) {
    const totalRounds = Number(await linguoContract.methods.getNumberOfRounds(ID).call());

    if (totalRounds === 0) {
      return undefined;
    }

    return linguoContract.methods.getRoundInfo(ID, totalRounds - 1).call();
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
      console.warn('Failed to create the translation task', err);
      throw new Error('Failed to create the translation task');
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

  async function approveTranslation({ ID }, { from, gas, gasPrice } = {}) {
    const txn = linguoContract.methods.acceptTranslation(ID).send({
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

  async function challengeTranslation({ ID, evidence }, { from, gas, gasPrice } = {}) {
    const value = await getChallengerDeposit({ ID });
    const txn = linguoContract.methods.challengeTranslation(ID, evidence).send({
      from,
      value,
      gas,
      gasPrice,
    });

    const receipt = await txn;
    return receipt;
  }

  async function fundAppeal({ ID, side }, { from, value, gas, gasPrice } = {}) {
    const txn = linguoContract.methods.fundAppeal(ID, side).send({
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
    getRequesterTasks,
    getTranslatorTasks,
    getTaskById,
    getTaskPrice,
    getTranslatorDeposit,
    getChallengerDeposit,
    getTaskDispute,
    createTask,
    assignTask,
    submitTranslation,
    approveTranslation,
    reimburseRequester,
    acceptTranslation,
    challengeTranslation,
    fundAppeal,
  };
}
