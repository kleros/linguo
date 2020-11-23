import dayjs from 'dayjs';
import deepMerge from 'deepmerge';
import Web3 from 'web3';
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

const { toBN } = Web3.utils;

export default function createContractApi({ web3, archon, linguo, arbitrator }) {
  const firstRelevantBlockByChainId = {
    42: 0,
    1: 11237802,
  };

  async function createTask(
    { account, deadline, minPrice, maxPrice, ...rest },
    { from = account, gas, gasPrice } = {}
  ) {
    deadline = dayjs(deadline).unix();

    const chainId = await web3.eth.getChainId();

    const metaEvidence = await publishMetaEvidence(
      {
        account,
        deadline,
        minPrice,
        maxPrice,
        ...rest,
      },
      { chainId }
    );

    const tx = linguo.methods.createTask(deadline, minPrice, metaEvidence).send({
      from,
      gas,
      gasPrice,
      value: maxPrice,
    });

    return { tx };
  }

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

    const assignedToAccountTaskIdsPromise = _getTaskIdsFromEvent('TaskAssigned', {
      fromBlock: 0,
      filter: { _translator: account },
    });
    const challengedByAccountTaskIdsPromise = _getTaskIdsFromEvent('TranslationChallenged', {
      fromBlock: 0,
      filter: { _challenger: account },
    });

    const currentBlockNumber = await web3.eth.getBlockNumber();

    const unassignedTaskIdsPromise = _getUnassignedTaskIds({ currentBlockNumber, skills });
    const assignedTaskIdsPromise = _getAssignedTaskIds({ currentBlockNumber });
    const inReviewTaskIdsPromise = _getInReviewTaskIds({ currentBlockNumber, skills });
    const inDisputeTaskIdsPromise = _getInDisputeTaskIds({ currentBlockNumber });
    const resolvedTaskIdsPromise = _getResolvedTaskIds({ currentBlockNumber });

    const [taskIds, ownTaskIds] = await Promise.all([
      Promise.allSettled([
        unassignedTaskIdsPromise,
        assignedTaskIdsPromise,
        inReviewTaskIdsPromise,
        inDisputeTaskIdsPromise,
        resolvedTaskIdsPromise,
        assignedToAccountTaskIdsPromise,
        challengedByAccountTaskIdsPromise,
      ]).then(result =>
        result
          .filter(({ status }) => status === 'fulfilled')
          .map(({ value }) => value)
          .flat()
      ),
      _getTaskIdsCreatedByAccount({ account }),
    ]);

    const taskIdsSet = new Set(taskIds);
    const ownTaskIdsSet = new Set(ownTaskIds);

    const relevantTaskIds = [...taskIdsSet].filter(ID => !ownTaskIdsSet.has(ID));

    const tasks = (await Promise.allSettled(relevantTaskIds.map(async ID => getTaskById({ ID }))))
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value);

    return tasks;
  }

  async function _getUnassignedTaskIds({ currentBlockNumber, skills }) {
    // We are going back ~180 days (considering ~4 blocks / minute)
    const unassingedRelevantBlocks = 4 * 60 * 24 * 180;
    const fromBlock = Math.max(0, currentBlockNumber - unassingedRelevantBlocks);

    const created = await _getTaskIdsFromEvent('TaskCreated', { fromBlock });
    const assigned = await _getTaskIdsFromEvent('TaskAssigned', { fromBlock });
    const resolved = await _getTaskIdsFromEvent('TaskResolved', { fromBlock });

    const unassignedTaskIds = created.filter(ID => !assigned.includes(ID) && !resolved.includes(ID));

    if (!Array.isArray(skills)) {
      return unassignedTaskIds;
    }

    const unassignedTasksMetadata = (await Promise.allSettled(unassignedTaskIds.map(ID => _getTaskMetadata({ ID }))))
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value);

    return unassignedTasksMetadata.filter(onlyIfMatchingSkills(skills)).map(({ ID }) => ID);
  }

  async function _getAssignedTaskIds({ currentBlockNumber }) {
    // We are going back ~180 days (considering ~4 blocks / minute)
    const inDisputeRelevantBlocks = 4 * 60 * 24 * 180;
    const fromBlock = Math.max(0, currentBlockNumber - inDisputeRelevantBlocks);

    return _getTaskIdsFromEvent('TaskAssigned', { fromBlock });
  }

  async function _getInReviewTaskIds({ currentBlockNumber, skills }) {
    const reviewTimeout = await linguo.methods.reviewTimeout().call();

    /**
     * We are adding 30% to the `reviewTimeout` to cope with fluctuations
     * in the 15s per block mining period if review timeout is small
     */
    const relevantBlocksCount = Math.round((Number(reviewTimeout) * 1.3) / 15);
    const fromBlock = Math.max(0, currentBlockNumber - relevantBlocksCount);

    const taskIdsInReview = await _getTaskIdsFromEvent('TranslationSubmitted', { fromBlock });

    if (!Array.isArray(skills)) {
      return taskIdsInReview;
    }

    const tasksInReviewMetadata = (await Promise.allSettled(taskIdsInReview.map(ID => _getTaskMetadata({ ID }))))
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value);

    return tasksInReviewMetadata.filter(onlyIfMatchingSkills(skills)).map(({ ID }) => ID);
  }

  async function _getInDisputeTaskIds({ currentBlockNumber }) {
    // We are going back ~180 days (considering ~4 blocks / minute)
    const inDisputeRelevantBlocks = 4 * 60 * 24 * 180;
    const fromBlock = Math.max(0, currentBlockNumber - inDisputeRelevantBlocks);

    return _getTaskIdsFromEvent('TranslationChallenged', { fromBlock });
  }

  async function _getResolvedTaskIds({ currentBlockNumber }) {
    // We are going back ~180 days (considering ~4 blocks / minute)
    const resolvedRelevantBlocks = 4 * 60 * 24 * 180;
    const fromBlock = Math.max(0, currentBlockNumber - resolvedRelevantBlocks);

    return _getTaskIdsFromEvent('TaskResolved', { fromBlock });
  }

  async function _getTaskIdsCreatedByAccount({ account }) {
    return _getTaskIdsFromEvent('TaskCreated', {
      filter: { _requester: account },
      fromBlock: 0,
    });
  }

  async function _getTaskIdsFromEvent(eventName, { fromBlock, toBlock, filter }) {
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

  async function getTaskPrice({ ID }) {
    try {
      return await linguo.methods.getTaskPrice(ID).call();
    } catch (err) {
      console.warn(`Failed to get price for task with ID ${ID}`, err);
      throw new Error(`Failed to get price for task with ID ${ID}`);
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
   * Because the `assignTask` method on both Linguo and LinguoToken contracts
   * sends any surplus value directly back to the sender, this has no impact in
   * the amount the translator has to lock in order to assign the task to himself
   * if the transaction gets mined before Δt has passed.
   *
   * @param {object} data
   * @param {string} data.ID
   * @param {object} options
   * @param {number} options.timeDeltaInSeconds
   */
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
    if (account === null) {
      return '0';
    }

    const amount = await linguo.methods.amountWithdrawable(ID, account).call();

    return amount;
  }

  async function getArbitrationCost() {
    const arbitratorExtraData = (await linguo.methods.arbitratorExtraData().call()) ?? `0x0`;
    const arbitrationCost = await archon.arbitrator.getArbitrationCost(arbitrator.options.address, arbitratorExtraData);

    return arbitrationCost;
  }

  async function assignTask({ ID }, { from, gas, gasPrice } = {}) {
    const value = await getTranslatorDeposit({ ID });
    const tx = linguo.methods.assignTask(ID).send({ from, value, gas, gasPrice });

    return { tx };
  }

  async function submitTranslation({ ID, uploadedFile }, { from, gas, gasPrice } = {}) {
    const { path, hash } = uploadedFile ?? {};

    if (!path || !hash) {
      throw new Error('Cannot submit a translation without a file');
    }

    const tx = linguo.methods.submitTranslation(ID, path).send({ from, gas, gasPrice });

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
      name: 'evidence.json',
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

  async function subscribe({ fromBlock = 0, filter = {} } = {}) {
    const chainId = await web3.eth.getChainId();
    const firstRelevantBlock = firstRelevantBlockByChainId[chainId] ?? 0;
    fromBlock = fromBlock < firstRelevantBlock ? firstRelevantBlock : fromBlock;

    return linguo.events.allEvents({ fromBlock, filter });
  }

  async function subscribeToArbitrator({ fromBlock = 0, filter = {} } = {}) {
    const chainId = await web3.eth.getChainId();
    const firstRelevantBlock = firstRelevantBlockByChainId[chainId] ?? 0;
    fromBlock = fromBlock < firstRelevantBlock ? firstRelevantBlock : fromBlock;

    return arbitrator.events.allEvents({ fromBlock, filter });
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
    getTranslatorDeposit,
    getChallengerDeposit,
    getTaskDispute,
    getTaskDisputeEvidences,
    getWithdrawableAmount,
    getArbitrationCost,
    createTask,
    assignTask,
    submitTranslation,
    approveTranslation,
    reimburseRequester,
    acceptTranslation,
    challengeTranslation,
    fundAppeal,
    submitEvidence,
    withdrawAllFeesAndRewards,
    subscribe,
    subscribeToArbitrator,
  };
}

const evidenceDisplayURIByChainId = {
  1: '/ipfs/QmXGDMfcxjfQi5SFwpBSb73pPjoZq2N8c6eWCgxx8pVqj7/index.html',
  42: '/ipfs/QmYbtF7K6qCfSYfu2k6nYnVRY8HY97rEAF6mgBWtDgfovw/index.html',
};

const dynamicScriptURIByChainId = {
  1: '/ipfs/QmchWC6L3dT23wwQiJJLWCeS1EDnDYrLcYat93C4Lm4P4E/linguo-dynamic-script.js',
  42: '/ipfs/QmZFcqdsR76jyHyLsBefc4SBuegj2boBDr2skxGauM5DNf/linguo-dynamic-script.js',
};

const publishMetaEvidence = async ({ account, ...metadata }, { chainId }) => {
  const evidenceDisplayInterfaceURI = evidenceDisplayURIByChainId[chainId] ?? evidenceDisplayURIByChainId[1];
  const dynamicScriptURI = dynamicScriptURIByChainId[chainId] ?? dynamicScriptURIByChainId[1];

  const metaEvidence = deepMerge(metaEvidenceTemplate, {
    evidenceDisplayInterfaceURI,
    dynamicScriptURI,
    aliases: {
      [account]: 'Requester',
    },
    metadata: {
      /**
       * v1:
       *  - Removed `text` field
       *  - Added `wordCount` field
       *  - `originalTextFile` is mandatory
       */
      __v: 1,
      ...metadata,
    },
  });

  const { path } = await ipfs.publish('linguo-meta-evidence.json', JSON.stringify(metaEvidence));

  return path;
};

const publishEvidence = async ({ name, template, overrides }) => {
  const encoder = new TextEncoder();

  const evidence = {
    ...template,
    ...overrides,
  };

  const { path } = await ipfs.publish(name, encoder.encode(JSON.stringify(evidence)));

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
