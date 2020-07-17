import dayjs from 'dayjs';
import deepMerge from 'deepmerge';
import Web3 from 'web3';
import { nanoid } from 'nanoid';
import ipfs from '~/app/ipfs';
import metaEvidenceTemplate from '~/assets/fixtures/metaEvidenceTemplate.json';
import challengeEvidenceTemplate from '~/assets/fixtures/challengeEvidenceTemplate';
import evidenceTemplate from '~/assets/fixtures/evidenceTemplate';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import { Dispute } from '~/features/disputes';
import { Task, TaskParty } from '~/features/tasks';
import promiseRetry from '~/shared/promiseRetry';
import { ADDRESS_ZERO, NON_PAYABLE_VALUE } from './constants';
import getFileUrl from './getFileUrl';

const { toWei, toBN } = Web3.utils;

export function createEthContractApi({ web3, archon, linguo, arbitrator }) {
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

    const tx = linguo.methods.createTask(deadline, minPrice, metaEvidence).send({
      from,
      gas,
      gasPrice,
      value: maxPrice,
    });

    return { tx };
  }

  async function getTranslatorDeposit({ ID }, { timeDeltaInSeconds = 3600 } = {}) {
    let [deposit, { minPrice, maxPrice, submissionTimeout }] = await Promise.all([
      linguo.methods.getDepositValue(ID).call(),
      linguo.methods.tasks(ID).call(),
    ]);

    deposit = toBN(deposit);
    minPrice = toBN(minPrice);
    maxPrice = toBN(maxPrice);
    submissionTimeout = toBN(submissionTimeout);

    const slope = maxPrice.sub(minPrice).div(submissionTimeout);
    const timeDelta = toBN(String(timeDeltaInSeconds));

    return String(deposit.add(slope.mul(timeDelta)));
  }

  return {
    ...createCommonApi({ web3, archon, linguo, arbitrator }, { getTranslatorDeposit }),
    createTask,
    getTranslatorDeposit,
  };
}

export function createTokenContractApi({ web3, archon, linguo, arbitrator }) {
  async function createTask(
    { account, deadline, minPrice, maxPrice, token, ...rest },
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
      token,
      ...rest,
    });

    const tx = linguo.methods
      .createTask(deadline, token, minPrice, maxPrice, metaEvidence)
      .send({ from, gas, gasPrice });

    return { tx };
  }

  async function getTranslatorDeposit({ ID }) {
    const deposit = await linguo.methods.getDepositValue(ID).call();

    return deposit;
  }

  return {
    ...createCommonApi({ web3, archon, linguo, arbitrator }, { getTranslatorDeposit }),
    createTask,
    getTranslatorDeposit,
  };
}

function createCommonApi({ web3, archon, linguo, arbitrator }, { getTranslatorDeposit }) {
  async function getRequesterTasks({ account }) {
    const events = await _getPastEvents(linguo, 'TaskCreated', {
      filter: { _requester: account },
      fromBlock: 0,
    });

    const tasks = (
      await Promise.allSettled(
        events.map(async event => {
          const ID = event.returnValues._taskID;
          if (!ID) {
            throw new Error('TaskCreated event has not task ID');
          }

          return getTaskById({ ID });
        })
      )
    )
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value);

    return tasks;
  }

  async function getTranslatorTasks({ account, skills = null }) {
    account = account ?? ADDRESS_ZERO;
    skills = typeof skills === 'string' ? JSON.parse(skills) : skills;

    const assignedTaskIDsPromise = _getTaskIDsFromEvent('TaskAssigned', {
      fromBlock: 0,
      filter: { _translator: account },
    });
    const challengedTaskIDsPromise = _getTaskIDsFromEvent('TranslationChallenged', {
      fromBlock: 0,
      filter: { _challenger: account },
    });

    const currentBlockNumber = await web3.eth.getBlockNumber();
    const unassignedTaskIDsPromise = _getUnassignedTaskIDs({ skills, currentBlockNumber });
    const inReviewTaskIdsPromise = _getInReviewTaskIDs({ skills, currentBlockNumber });

    const taskIDs = (
      await Promise.allSettled([
        unassignedTaskIDsPromise,
        inReviewTaskIdsPromise,
        assignedTaskIDsPromise,
        challengedTaskIDsPromise,
      ])
    )
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value)
      .flat();

    const uniqueTaskIDs = [...new Set([...taskIDs])];

    const tasks = (await Promise.allSettled(uniqueTaskIDs.map(async ID => getTaskById({ ID }))))
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value);

    return tasks;
  }

  async function _getUnassignedTaskIDs({ currentBlockNumber, skills }) {
    /**
     * We are going back ~60 days (considering ~4 blocks / minute)
     */
    const unassingedRelevantBlocks = 345600;
    const fromBlock = currentBlockNumber - unassingedRelevantBlocks;

    const created = await _getTaskIDsFromEvent('TaskCreated', { fromBlock });
    const assigned = await _getTaskIDsFromEvent('TaskAssigned', { fromBlock });
    const resolved = await _getTaskIDsFromEvent('TaskResolved', { fromBlock });

    const unassignedTaskIDs = created.filter(ID => !assigned.includes(ID) && !resolved.includes(ID));

    if (!Array.isArray(skills)) {
      return unassignedTaskIDs;
    }

    const unassignedTasksMetadata = (await Promise.allSettled(unassignedTaskIDs.map(ID => _getTaskMetadata({ ID }))))
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value);

    return unassignedTasksMetadata.filter(onlyIfMatchingSkills(skills)).map(({ ID }) => ID);
  }

  async function _getInReviewTaskIDs({ currentBlockNumber, skills }) {
    const reviewTimeout = await linguo.methods.reviewTimeout().call();

    /**
     * We are adding 20% to the `reviewTimeout` to cope with fluctuations
     * in the 15s per block mining period if review timeout is small
     */
    const relevantBlocksCount = Math.round((Number(reviewTimeout) * 1.2) / 15);
    const fromBlock = currentBlockNumber - relevantBlocksCount;

    const taskIDsInReview = await _getTaskIDsFromEvent('TranslationSubmitted', { fromBlock });

    const tasksInReviewMetadata = (await Promise.allSettled(taskIDsInReview.map(ID => _getTaskMetadata({ ID }))))
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value);

    if (!Array.isArray(skills)) {
      return taskIDsInReview;
    }

    return tasksInReviewMetadata.filter(onlyIfMatchingSkills(skills)).map(({ ID }) => ID);
  }

  async function _getTaskIDsFromEvent(eventName, { fromBlock, toBlock, filter }) {
    const events = await _getPastEvents(linguo, eventName, {
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
      const [
        reviewTimeout,
        task,
        taskParties,
        taskCreatedEvents,
        taskAssignedEvents,
        translationSubmittedEvents,
        translationChallengedEvents,
        taskResolvedEvents,
        metadata,
      ] = await Promise.all([
        linguo.methods.reviewTimeout().call(),
        linguo.methods.tasks(ID).call(),
        linguo.methods.getTaskParties(ID).call(),
        _getPastEvents(linguo, 'TaskCreated', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        _getPastEvents(linguo, 'TaskAssigned', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        _getPastEvents(linguo, 'TranslationSubmitted', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        _getPastEvents(linguo, 'TranslationChallenged', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        _getPastEvents(linguo, 'TaskResolved', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        _getTaskMetadata({ ID }),
      ]);

      const disputeEvents =
        translationChallengedEvents.length > 0
          ? await _getPastEvents(linguo, 'Dispute', {
              filter: { _disputeID: task.disputeID },
              fromBlock: 0,
            })
          : [];

      return Task.normalize({
        ID,
        contract: linguo.options.address,
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

    try {
      const metaEvidenceEvents = await _getPastEvents(linguo, 'MetaEvidence', {
        filter: { _metaEvidenceID: ID },
        fromBlock: 0,
      });
      const { metadata } = await fetchMetaEvidenceFromEvents({
        ID,
        events: metaEvidenceEvents,
      });

      return { ID, ...metadata };
    } catch (err) {
      console.warn('Error feching task metadata', err);
      throw err;
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
  async function getTaskPrice({ ID }) {
    try {
      return await linguo.methods.getTaskPrice(ID).call();
    } catch (err) {
      console.warn(`Failed to get price for task with ID ${ID}`, err);
      throw new Error(`Failed to get price for task with ID ${ID}`);
    }
  }

  async function getChallengerDeposit({ ID }) {
    const deposit = await linguo.methods.getChallengeValue(ID).call();
    return deposit;
  }

  async function getTaskDispute({ ID }) {
    const { task, dispute } = await _getTaskAndDisputeDetails({ ID });

    if (!task.hasDispute) {
      return {};
    }

    const [latestRound, rewardPoolParams] = await Promise.all([_getLatestTaskRound({ ID }), _getRewardPoolParams()]);

    const aggregateDispute = {
      ...dispute,
      latestRound,
    };

    return Dispute.normalize(aggregateDispute, task, rewardPoolParams);
  }

  async function _getTaskAndDisputeDetails({ ID }) {
    const task = await linguo.methods.tasks(ID).call();
    const { disputeID } = task;

    const disputeInfo = await _getDisputeRulingAndStatus({ disputeID });
    const { hasDispute, status, ruling } = disputeInfo;

    if (!hasDispute) {
      return {
        task: {
          ...task,
          hasDispute,
        },
      };
    }

    const [appealPeriod, appealCost] = await Promise.all([
      _getAppealPeriod({ disputeID }),
      _getAppealCost({ disputeID }),
    ]);

    return {
      task: {
        ...task,
        hasDispute,
      },
      dispute: {
        status,
        ruling,
        appealPeriod,
        appealCost,
      },
    };
  }

  async function _getDisputeRulingAndStatus({ disputeID }) {
    const disputeEvents = await _getPastEvents(linguo, 'Dispute', {
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
        arbitrator.methods.disputeStatus(disputeID).call(),
        arbitrator.methods.currentRuling(disputeID).call(),
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

  async function _getPastEvents(contract, eventName, { filter, fromBlock = 0, toBlock = 'latest' } = {}) {
    return promiseRetry(
      contract
        .getPastEvents(eventName, {
          fromBlock,
          toBlock,
          filter,
        })
        .then(events => {
          if (events.some(({ event }) => event === undefined)) {
            console.warn('Failed to get log values for event', { eventName, filter, events });
            throw new Error('Failed to get log values for event');
          }

          return events;
        }),
      {
        maxAttempts: 5,
        delay: count => 500 + count * 1000,
        shouldRetry: err => err.message === 'Failed to get log values for event',
      }
    );
  }

  async function _getAppealPeriod({ disputeID }) {
    try {
      return await arbitrator.methods.appealPeriod(disputeID).call();
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
      return await arbitrator.methods.appealCost(disputeID, '0x0').call();
    } catch (err) {
      console.warn('Could not get dispute appeal cost', err);
      return NON_PAYABLE_VALUE;
    }
  }

  async function _getRewardPoolParams() {
    const [winnerStakeMultiplier, loserStakeMultiplier, sharedStakeMultiplier, multiplierDivisor] = await Promise.all([
      linguo.methods.winnerStakeMultiplier().call(),
      linguo.methods.loserStakeMultiplier().call(),
      linguo.methods.sharedStakeMultiplier().call(),
      linguo.methods.MULTIPLIER_DIVISOR().call(),
    ]);

    return {
      winnerStakeMultiplier,
      loserStakeMultiplier,
      sharedStakeMultiplier,
      multiplierDivisor,
    };
  }

  async function _getLatestTaskRound({ ID }) {
    const totalRounds = Number(await linguo.methods.getNumberOfRounds(ID).call());

    if (totalRounds === 0) {
      return undefined;
    }

    return linguo.methods.getRoundInfo(ID, totalRounds - 1).call();
  }

  async function getTaskDisputeEvidences({ ID }) {
    const evidences = await archon.arbitrable.getEvidence(linguo.options.address, arbitrator.options.address, ID);

    // return evidences.filter(({ fileValid }) => fileValid);
    return evidences.filter(({ evidenceJSONValid }) => !!evidenceJSONValid);
  }

  async function getWithdrawableAmount({ ID, account }) {
    const amount = await linguo.methods.amountWithdrawable(ID, account).call();

    return amount;
  }

  async function getArbitrationCost() {
    const arbitratorExtraData = await linguo.methods.arbitratorExtraData().call();
    const arbitrationCost = await archon.arbitrator.getArbitrationCost(arbitrator.options.address, arbitratorExtraData);

    return arbitrationCost;
  }

  async function assignTask({ ID }, { from, gas, gasPrice } = {}) {
    const value = await getTranslatorDeposit({ ID });
    const tx = linguo.methods.assignTask(ID).send({ from, value, gas, gasPrice });

    return { tx };
  }

  async function submitTranslation({ ID, text }, { from, gas, gasPrice } = {}) {
    const tx = linguo.methods.submitTranslation(ID, text).send({ from, gas, gasPrice });

    return { tx };
  }

  async function approveTranslation({ ID }, { from, gas, gasPrice } = {}) {
    const tx = linguo.methods.acceptTranslation(ID).send({ from, gas, gasPrice });

    return { tx };
  }

  async function reimburseRequester({ ID }, { from, gas, gasPrice } = {}) {
    const tx = linguo.methods.reimburseRequester(ID).send({ from, gas, gasPrice });

    return { tx };
  }

  async function acceptTranslation({ ID }, { from, gas, gasPrice } = {}) {
    const tx = linguo.methods.acceptTranslation(ID).send({ from, gas, gasPrice });

    return { tx };
  }

  async function challengeTranslation({ ID, uploadedFile }, { from, gas, gasPrice } = {}) {
    const { path, hash } = uploadedFile ?? {};

    if (!path || !hash) {
      throw new Error('Cannot submit a challenge without an evidence file');
    }

    const evidence = await publishEvidence({
      name: `linguo-challenge-${ID}.json`,
      template: challengeEvidenceTemplate,
      overrides: {
        supportingSide: TaskParty.Challenger,
        fileURI: path,
        fileTypeExtension: getFileTypeFromPath(path),
        fileHash: hash,
      },
    });

    const value = await getChallengerDeposit({ ID });
    const tx = linguo.methods.challengeTranslation(ID, evidence).send({ from, value, gas, gasPrice });

    return { tx };
  }

  async function fundAppeal({ ID, side }, { from, value, gas, gasPrice } = {}) {
    const tx = linguo.methods.fundAppeal(ID, side).send({ from, value, gas, gasPrice });

    return { tx };
  }

  async function submitEvidence({ ID, supportingSide, name, description, uploadedFile }, { from, gas, gasPrice } = {}) {
    if (![TaskParty.Translator, TaskParty.Challenger].includes(supportingSide)) {
      throw new Error('Evidence must either support the translator or the challenger');
    }

    const { path, hash } = uploadedFile ?? {};

    const fileOverrides =
      path && hash
        ? {
            fileURI: path,
            fileTypeExtension: getFileTypeFromPath(path),
            fileHash: hash,
          }
        : {};

    const evidence = await publishEvidence({
      name: `linguo-evidence-${nanoid(10)}.json`,
      template: evidenceTemplate,
      overrides: {
        name,
        description,
        supportingSide,
        ...fileOverrides,
      },
    });

    const tx = linguo.methods.submitEvidence(ID, evidence).send({ from, gas, gasPrice });

    return { tx };
  }

  function withdrawAllFeesAndRewards({ ID, account }, { from = account, gas, gasPrice } = {}) {
    const tx = linguo.methods.batchRoundWithdraw(account, ID, '0', '0').send({ from, gas, gasPrice });

    return { tx };
  }

  return {
    getRequesterTasks,
    getTranslatorTasks,
    getTaskById,
    getTaskPrice,
    getChallengerDeposit,
    getTaskDispute,
    getTaskDisputeEvidences,
    getWithdrawableAmount,
    getArbitrationCost,
    assignTask,
    submitTranslation,
    approveTranslation,
    reimburseRequester,
    acceptTranslation,
    challengeTranslation,
    fundAppeal,
    submitEvidence,
    withdrawAllFeesAndRewards,
  };
}

const publishMetaEvidence = async ({ account, ...metadata }) => {
  const metaEvidence = deepMerge(metaEvidenceTemplate, {
    aliases: {
      [account]: 'Requester',
    },
    metadata,
  });

  const { path } = await ipfs.publish('linguo-meta-evidence.json', JSON.stringify(metaEvidence));

  return path;
};

const encoder = new TextEncoder();

const publishEvidence = async ({ name, template, overrides }) => {
  const challengeEvidence = {
    ...template,
    ...overrides,
  };

  const { path } = await ipfs.publish(name, encoder.encode(JSON.stringify(challengeEvidence)));

  return path;
};

const getFileTypeFromPath = path => (path ?? '').split('.').slice(-1)?.[0];

const fetchMetaEvidenceFromEvents = async ({ ID, events }) => {
  console.debug('Fetching MetaEvidence', events);
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
    const response = await fetch(url, {
      // mode: 'cors'
    });
    return response.json();
  } catch (err) {
    console.warn(`Failed to fetch evidence for task ${ID}`, err);
    throw new Error(`Failed to fetch evidence for task ${ID}`);
  }
};

const onlyIfMatchingSkills = skills => ({ sourceLanguage, targetLanguage, expectedQuality }) => {
  /**
   * Z1 level does not exist for any language, so we are just using this as
   * a fallback in case we find an unexpected value for `expectedQuality`.
   * In this case, since the task is non-standard, it should not be shown
   * to a translator.
   */
  const requiredLevel = translationQualityTiers[expectedQuality]?.requiredLevel ?? 'Z1';
  const satisfiesSource = skills.some(skill => skill.language === sourceLanguage && skill.level >= requiredLevel);
  const satisfiesTarget = skills.some(skill => skill.language === targetLanguage && skill.level >= requiredLevel);

  return satisfiesSource && satisfiesTarget;
};
