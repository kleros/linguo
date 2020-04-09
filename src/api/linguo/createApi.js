import dayjs from 'dayjs';
import Web3 from 'web3';
import ipfs from '~/app/ipfs';
import metaEvidenteTemplate from '~/assets/fixtures/metaEvidenceTemplate.json';
import createError from '~/utils/createError';
import { normalize } from './entities/Task';
import getFilter from './filters';
import getComparator from './sorting';

const { toWei } = Web3.utils;

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
    throw new Error(`No evidence found for task ${ID}`);
  }

  const { _evidence: path } = event.returnValues;
  if (!path) {
    throw new Error(`No evidence found for task ${ID}`);
  }

  const url = ipfs.generateUrl(path);

  try {
    const response = await fetch(url);
    return response.json();
  } catch (err) {
    throw createError(`Failed to fetch evidence for task ${ID}`, { cause: err });
  }
};

export default function createApi({ contract }) {
  async function createTask({ account, deadline, minPrice, maxPrice, ...rest }) {
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
      const receipt = await contract.methods.createTask(deadline, minPrice, metaEvidence).send({
        from: account,
        value: maxPrice,
      });

      return receipt;
    } catch (err) {
      throw createError('Failed to create the translation task', { cause: err });
    }
  }

  async function getTaskById(ID) {
    try {
      const [
        task,
        reviewTimeout,
        metaEvidenceEvents,
        taskCreatedEvents,
        translationSubmittedEvents,
      ] = await Promise.all([
        contract.methods.tasks(ID).call(),
        contract.methods.reviewTimeout().call(),
        contract.getPastEvents('MetaEvidence', {
          filter: { _metaEvidenceID: ID },
          fromBlock: 0,
        }),
        contract.getPastEvents('TaskCreated', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
        contract.getPastEvents('TranslationSubmitted', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
      ]);

      const { metadata } = await fetchMetaEvidenceFromEvents({ ID, events: metaEvidenceEvents });

      return normalize({
        ID,
        reviewTimeout,
        task,
        metadata,
        lifecyleEvents: {
          TaskCreated: taskCreatedEvents,
          TranslationSubmitted: translationSubmittedEvents,
        },
      });
    } catch (err) {
      return { ID, error: err };
    }
  }

  async function getOwnTasks(account, { filter = 'all' } = {}) {
    const events = await contract.getPastEvents('TaskCreated', {
      filter: { _requester: account },
      fromBlock: 0,
    });

    const tasks = await Promise.all(events.map(event => getTaskById(event.returnValues._taskID)));

    return tasks.filter(getFilter(filter)).sort(getComparator(filter));
  }

  return {
    createTask,
    getOwnTasks,
    getTaskById,
  };
}
