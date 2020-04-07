import dayjs from 'dayjs';
import ipfs from '~/app/ipfs';
import metaEvidenteTemplate from '~/assets/fixtures/metaEvidenceTemplate.json';
import createError from '~/utils/createError';
import {
  calculateRemainingReviewTimeInSeconds,
  calculateRemainingSubmitTimeInSeconds,
  isAborted,
} from './entities/Task';
import TaskStatus from './entities/TaskStatus';

const extractOriginalTextFilePath = originalTextFile => {
  if (originalTextFile?.length > 0) {
    const { status, path } = originalTextFile[0].response || {};

    if (status === 'done' && !!path) {
      return path;
    }
  }

  return undefined;
};

const createMetaEvidence = async ({ originalTextFile, account, ...rest }) => {
  const metadata = {
    ...rest,
    originalTextFile: extractOriginalTextFilePath(originalTextFile),
  };

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

const fetchMetaEvidenceFromEvents = async ({ ID, events }) => {
  // There should be one and only one event;
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

export default function createApi({ contract, toWei, BigNumber }) {
  async function createTask({ account, deadline, minPrice, maxPrice, ...rest }) {
    minPrice = toWei(String(minPrice), 'ether');
    maxPrice = toWei(String(maxPrice), 'ether');
    deadline = dayjs(deadline).unix();

    const metaEvidence = await createMetaEvidence({
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
      const [task, currentPrice, reviewTimeout, metaEvidenceEvents, translationSubmittedEvents] = await Promise.all([
        contract.methods.tasks(ID).call(),
        contract.methods.getTaskPrice(ID).call(),
        contract.methods.reviewTimeout(),
        contract.getPastEvents('MetaEvidence', {
          filter: { _metaEvidenceID: ID },
          fromBlock: 0,
        }),
        contract.getPastEvents('TranslationSubmitted', {
          filter: { _taskID: ID },
          fromBlock: 0,
        }),
      ]);

      const { minPrice, maxPrice, requester, disputeID } = task;
      const status = Number(task.status);
      const lastInteraction = dayjs.unix(Number(task.lastInteraction));
      const submissionTimeout = Number(task.submissionTimeout);

      const { metadata } = await fetchMetaEvidenceFromEvents({ ID, events: metaEvidenceEvents });
      const { title, sourceLanguage, targetLanguage, expectedQuality, text } = metadata;
      const deadline = dayjs(task.deadline);
      const textLength = text.split(/\s+/g).length;
      const currentPricePerWord = new BigNumber(currentPrice).div(new BigNumber(String(textLength))).toString();

      const aborted = isAborted({ status, lastInteraction, submissionTimeout, translationSubmittedEvents });

      return {
        ID: Number(ID),
        disputeID,
        requester,
        currentPrice,
        currentPricePerWord,
        minPrice,
        maxPrice,
        status,
        lastInteraction,
        submissionTimeout,
        reviewTimeout,
        title,
        deadline,
        sourceLanguage,
        targetLanguage,
        expectedQuality,
        text,
        textLength,
        aborted,
      };
    } catch (err) {
      return { ID, error: err };
    }
  }

  const createSorting = (descriptor = {}) => (a, b) =>
    Object.entries(descriptor).reduce((acc, [prop, signOrComparator]) => {
      const hasDefinedSortOrder = acc !== 0;
      return hasDefinedSortOrder
        ? acc
        : typeof signOrComparator === 'number'
        ? signOrComparator * (b[prop] - a[prop])
        : signOrComparator(a, b);
    }, 0);

  const filterMap = {
    all: () => true,
    open: ({ status, aborted }) => !aborted && status === TaskStatus.Created,
    inProgress: ({ status }) => status === TaskStatus.Assigned,
    inReview: ({ status }) => status === TaskStatus.AwaitingReview,
    inDispute: ({ status }) => status === TaskStatus.DisputeCreated,
    finished: ({ status, aborted }) => !aborted && status === TaskStatus.Resolved,
    aborted: ({ aborted }) => !!aborted,
  };

  const sortingMap = {
    all: {
      aborted: -1,
      remainingSubmitTime: (a, b) =>
        calculateRemainingSubmitTimeInSeconds(a) - calculateRemainingSubmitTimeInSeconds(b),
      ID: -1,
    },
    open: {
      currentPricePerWord: -1,
      ID: -1,
    },
    inProgress: {
      remainingSubmitTime: (a, b) =>
        calculateRemainingSubmitTimeInSeconds(b) - calculateRemainingSubmitTimeInSeconds(a),
      ID: -1,
    },
    inReview: {
      remainingReviewTime: (a, b) =>
        calculateRemainingReviewTimeInSeconds(b) - calculateRemainingReviewTimeInSeconds(a),
      ID: -1,
    },
    inDispute: {
      disputeID: -1,
    },
    finished: {
      ID: -1,
    },
    aborted: {
      lastInteraction: -1,
      ID: 1,
    },
  };

  async function getOwnTasks(account, { filter = 'all' } = {}) {
    const events = await contract.getPastEvents('TaskCreated', {
      filter: { _requester: account },
      fromBlock: 0,
    });

    const tasks = await Promise.all(events.map(event => getTaskById(event.returnValues._taskID)));

    return tasks.filter(filterMap[filter]).sort(createSorting(sortingMap[filter]));
  }

  return {
    createTask,
    getOwnTasks,
    getTaskById,
  };
}
