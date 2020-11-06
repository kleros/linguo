import { createAction } from '@reduxjs/toolkit';
import { eventChannel } from 'redux-saga';
import { serializeError } from 'serialize-error';
import { TaskParty } from '~/features/tasks';
import { pick } from '~/shared/fp';
import { ADDRESS_ZERO } from './constants';

const prepare = (payload, rest = {}) => ({ payload, ...rest });

export const taskCreated = createAction('tasks/updates/taskCreated', prepare);
export const taskAssigned = createAction('tasks/updates/taskAssigned', prepare);
export const translationSubmitted = createAction('tasks/updates/translationSubmitted', prepare);
export const translationChallenged = createAction('tasks/updates/translationChallenged', prepare);
export const appealContribution = createAction('tasks/updates/appealFeeContribution', prepare);
export const paidAppealFee = createAction('tasks/updates/paidAppealFee', prepare);
export const taskResolved = createAction('tasks/updates/taskResolved', prepare);

export default function createTaskUpdatesChannel(subscriptions) {
  return eventChannel(emit => {
    subscriptions.map(subscription =>
      subscription
        .on('data', data => {
          if (isEventRelevant(data)) {
            emit(normalize(data));
          }
        })
        .on('error', err => {
          emit({
            type: 'CONTRACT_EVENT_ERROR',
            payload: {
              error: serializeError(err),
            },
          });
        })
    );

    return () => subscriptions.map(subscription => subscription.unsubscribe());
  });
}

function normalize(data) {
  if (!dataNormalizers[data.event]) {
    throw new Error(`Processing invalid event ${data.event}`);
  }

  return dataNormalizers[data.event](data);
}

const getMetadata = pick(['address', 'blockNumber', 'transactionHash']);

const dataNormalizers = {
  TaskCreated(data) {
    const id = `${data.address}/${data.returnValues._taskID}`;
    const token = data.returnValues._token ?? ADDRESS_ZERO;
    const requester = data.returnValues._requester;
    const timestamp = Number(data.returnValues._timestamp);

    return taskCreated({ id, requester, timestamp, token }, { meta: getMetadata(data) });
  },
  TaskAssigned(data) {
    const id = `${data.address}/${data.returnValues._taskID}`;
    const translator = data.returnValues._translator;
    const price = data.returnValues._price;
    const timestamp = Number(data.returnValues._timestamp);

    return taskAssigned({ id, translator, price, timestamp }, { meta: getMetadata(data) });
  },
  TranslationSubmitted(data) {
    const id = `${data.address}/${data.returnValues._taskID}`;
    const translator = data.returnValues._translator;
    const translatedText = data.returnValues._translatedText;
    const timestamp = Number(data.returnValues._timestamp);

    return translationSubmitted({ id, translator, translatedText, timestamp }, { meta: getMetadata(data) });
  },
  TranslationChallenged(data) {
    const id = `${data.address}/${data.returnValues._taskID}`;
    const challenger = data.returnValues._challenger;
    const timestamp = Number(data.returnValues._timestamp);

    return translationChallenged({ id, challenger, timestamp }, { meta: getMetadata(data) });
  },
  AppealContribution(data) {
    const id = `${data.address}/${data.returnValues._taskID}`;
    const party = TaskParty.of(data.returnValues._party);
    const contributor = data.returnValues._contributor;
    const amount = data.returnValues._amount;

    return appealContribution({ id, party, contributor, amount }, { meta: getMetadata(data) });
  },
  HasPaidAppealFee(data) {
    const id = `${data.address}/${data.returnValues._taskID}`;
    const party = TaskParty.of(data.returnValues._party);
    return paidAppealFee({ id, party }, { meta: getMetadata(data) });
  },
  TaskResolved(data) {
    const id = `${data.address}/${data.returnValues._taskID}`;
    const reason = data.returnValues._reason;
    const timestamp = data.returnValues._timestamp;

    return taskResolved({ id, reason, timestamp }, { meta: getMetadata(data) });
  },
};

const eventWhitelist = Object.keys(dataNormalizers);

const isEventRelevant = data => eventWhitelist.includes(data.event);
