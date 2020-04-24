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

let id = 0;
export const fetchMetaEvidenceFromEvents = async ({ ID, events }) => {
  // There should be one and only one event
  const [event] = events;
  if (!event) {
    throw new Error(`No evidence found for task ${ID}`);
  }

  const { _evidence: path } = event.returnValues;
  if (!path) {
    throw new Error(`No evidence found for task ${ID}`);
  }

  const url = getFileUrl(path);

  try {
    const response = await fetch(url);
    return response.json();
  } catch (err) {
    throw createError(`Failed to fetch evidence for task ${ID}`, { cause: err });
  }
};

export default function createApi({ contract }) {
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
      const contractCall = contract.methods.createTask(deadline, minPrice, metaEvidence);

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

  async function getTaskById({ ID }) {
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
        contract.methods.reviewTimeout().call(),
        contract.methods.tasks(ID).call(),
        contract.methods.getTaskParties(ID).call(),
        contract.getPastEvents('MetaEvidence', {
          filter: { _metaEvidenceID: ID },
          fromBlock: 0,
        }),
        contract.getPastEvents('TaskCreated', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        contract.getPastEvents('TaskAssigned', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        contract.getPastEvents('TranslationSubmitted', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        contract.getPastEvents('TranslationChallenged', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        contract.getPastEvents('TaskResolved', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
      ]);

      const { metadata } = await fetchMetaEvidenceFromEvents({ ID, events: metaEvidenceEvents });

      return normalize({
        ID,
        reviewTimeout,
        task: { ...task, parties: taskParties },
        metadata,
        lifecyleEvents: {
          TaskCreated: taskCreatedEvents,
          TaskAssigned: taskAssignedEvents,
          TranslationSubmitted: translationSubmittedEvents,
          TranslationChallenged: translationChallengedEvents,
          TaskResolved: taskResolvedEvents,
        },
      });
    } catch (err) {
      console.error(err);
      throw createError(new Error(`Failed to fetch task with ID ${ID}`), { cause: err });
    }
  }

  async function getOwnTasks({ account }) {
    const events = await contract.getPastEvents('TaskCreated', {
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

  async function getTranslatorDeposit({ ID }) {
    /**
     * Adds 10% to the actual required deposit to take time until mining into consideration
     */
    const deposit = toBN(await contract.methods.getDepositValue(ID).call());
    const additionalMargin = toBN('10');
    return String(deposit.add(deposit.mul(additionalMargin).div(toBN('100'))));
  }

  async function assignTask({ ID }, { from, gas, gasPrice } = {}) {
    const value = await getTranslatorDeposit({ ID });
    const txn = contract.methods.assignTask(ID).send({
      from,
      value,
      gas,
      gasPrice,
    });

    const receipt = await txn;
    return receipt;
  }

  async function submitTranslation({ ID, text }, { from, gas, gasPrice } = {}) {
    const txn = contract.methods.submitTranslation(ID, text).send({
      from,
      gas,
      gasPrice,
    });

    const receipt = await txn;
    return receipt;
  }

  async function requestReimbursement({ ID }, { from, gas, gasPrice } = {}) {
    const txn = contract.methods.reimburseRequester(ID).send({
      from,
      gas,
      gasPrice,
    });

    const receipt = await txn;
    return receipt;
  }

  return {
    id: ++id,
    createTask,
    getOwnTasks,
    getTaskById,
    getTranslatorDeposit,
    assignTask,
    submitTranslation,
    requestReimbursement,
  };
}
