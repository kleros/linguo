import { createAction, createSlice } from '@reduxjs/toolkit';
import {
  actionChannel,
  all,
  call,
  cancelled,
  delay,
  fork,
  getContext,
  put,
  putResolve,
  race,
  select,
  take,
} from 'redux-saga/effects';
import { DisputeRuling } from '~/features/disputes';
import { put as putNotification } from '~/features/notifications/notificationsSlice';
import { selectTaskIdFromDisputeId } from '~/features/disputes/disputesSlice';
import createCancellableSaga from '~/shared/createCancellableSaga';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import createTaskUpdatesChannel, {
  taskAssigned,
  taskCreated,
  taskResolved,
  translationChallenged,
  receivedAppealableRuling,
  appealContribution,
  paidAppealFee,
  disputeAppealed,
  translationSubmitted,
} from './createTaskUpdatesChannel';
import { TaskStatus, TaskParty } from './entities';
import { actions as singleTaskActions } from './singleTaskSlice';

const prepare = (payload, rest = {}) => ({ payload, ...rest });

const subscribeToUpdates = createAction('tasks/updates/subscribe', prepare);
const unsubscribeFromUpdates = createAction('tasks/updates/unsubscribe', prepare);

export const initialState = {
  byAccount: {},
};
const taskUpdatesSlice = createSlice({
  name: 'tasks/updates',
  initialState,
  extraReducers: builder => {
    builder.addCase(taskCreated.type, (state, action) => {
      const { id, requester } = action.payload;
      const { account } = action.meta;

      if (account === requester) {
        state.byAccount[account] = state.byAccount[account] ?? {};
        state.byAccount[account][id] = {
          role: Role.Requester,
        };
      }
    });

    builder.addCase(taskAssigned.type, (state, action) => {
      const { id, translator } = action.payload;
      const { account } = action.meta;

      if (account === translator) {
        state.byAccount[account] = state.byAccount[account] ?? {};
        state.byAccount[account][id] = state.byAccount[account][id] ?? {};

        const currentRole = state.byAccount[account][id].role;
        if (currentRole === undefined) {
          state.byAccount[account][id].role = Role.Translator;
        }
      }
    });

    builder.addCase(translationChallenged.type, (state, action) => {
      const { id, challenger } = action.payload;
      const { account } = action.meta;

      if (account === challenger) {
        state.byAccount[account] = state.byAccount[account] ?? {};
        state.byAccount[account][id] = state.byAccount[account][id] ?? {};

        const currentRole = state.byAccount[account][id].role;
        if (currentRole === undefined || currentRole === Role.Requester) {
          state.byAccount[account][id].role = Role.Challenger;
        }
      }
    });

    builder.addCase(appealContribution.type, (state, action) => {
      const { id, contributor } = action.payload;
      const { account } = action.meta;

      if (account === contributor) {
        state.byAccount[account] = state.byAccount[account] ?? {};
        state.byAccount[account][id] = state.byAccount[account][id] ?? {};

        const currentRole = state.byAccount[account][id].role;
        if (currentRole === undefined) {
          state.byAccount[account][id].role = Role.Contributor;
        }
      }
    });
  },
});

const selectRole = (state, { account, id }) => state.byAccount[account]?.[id]?.role;

export default taskUpdatesSlice.reducer;

export const actions = {
  subscribeToUpdates,
  unsubscribeFromUpdates,
  taskCreated,
  taskAssigned,
  translationSubmitted,
  translationChallenged,
  appealContribution,
  paidAppealFee,
  taskResolved,
  ...taskUpdatesSlice.actions,
};

export function* subscribeSaga(action) {
  const { fromBlock, filter, account } = action.payload ?? {};

  const linguoApi = yield getContext('linguoApi');
  const [subscriptions, arbitratorSubscriptions] = yield all([
    call([linguoApi, 'subscribe'], { fromBlock, filter }),
    call([linguoApi, 'subscribeToArbitrator'], { fromBlock, filter }),
  ]);

  const chan = yield call(createTaskUpdatesChannel, [...subscriptions, ...arbitratorSubscriptions]);

  try {
    while (true) {
      const event = yield take(chan);
      const preparedEvent = {
        ...event,
        meta: {
          ...event.meta,
          account,
        },
      };
      yield put(preparedEvent);
      yield fork(handleUpdatesSaga, preparedEvent);
    }
  } finally {
    if (yield cancelled()) {
      chan.close();
    }
  }
}

export function* handleUpdatesSaga(action) {
  const { id } = action.payload;
  const { account } = action.meta;
  const role = yield select(state => selectRole(state.tasks.updates, { id, account }));

  const handler = handlersByType[action.type];
  if (handler) {
    yield fork(handler, action, { role });
  }
}

const createWatchSubscribeSaga = createWatcherSaga(
  { takeType: TakeType.every },
  createCancellableSaga(subscribeSaga, unsubscribeFromUpdates, {
    additionalPayload: action => ({ id: action.payload?.id }),
    additionalArgs: action => ({ meta: action.meta }),
  })
);

export const sagaDescriptors = [[createWatchSubscribeSaga, actionChannel(subscribeToUpdates.type)]];

const Role = {
  Requester: 'requester',
  Translator: 'translator',
  Challenger: 'challenger',
  Contributor: 'contributor',
  Other: 'other',
};

const handlersByType = {
  *[taskAssigned](action, { role }) {
    if (role !== Role.Requester) {
      return;
    }

    const { id } = action.payload;
    const { account, blockNumber } = action.meta;

    yield put(
      putNotification({
        id: `${blockNumber}-TaskAssigned-${account}-${id}`,
        account,
        blockNumber,
        priority: 10,
        data: {
          type: 'info',
          icon: 'bell',
          text: 'A translator was assigned to the translation task.',
          url: `/translation/${id}`,
        },
      })
    );
  },
  *[translationSubmitted](action, { role }) {
    if (role !== Role.Requester) {
      return;
    }

    const { id } = action.payload;
    const { account, blockNumber } = action.meta;

    yield put(
      putNotification({
        id: `${blockNumber}-TranslationSubmitted-${account}-${id}`,
        account,
        blockNumber,
        priority: 20,
        data: {
          type: 'info',
          icon: 'confirmation',
          text:
            'The translator delivered the translated text. It will be in the Review List before the escrow payment is released.',
          url: `/translation/${id}`,
        },
      })
    );
  },
  *[translationChallenged](action, { role }) {
    if (![Role.Requester, Role.Translator].includes(role)) {
      return;
    }

    const { id } = action.payload;
    const { account, blockNumber } = action.meta;

    yield put(
      putNotification({
        id: `${blockNumber}-TranslationChallenged-${account}-${id}`,
        account,
        blockNumber,
        priority: 30,
        data: {
          type: 'warning',
          icon: 'dispute',
          text:
            'The translation was challenged. Now it goes to Kleros arbitration. When Jurors decide the case you will be informed.',
          url: `/translation/${id}`,
        },
      })
    );
  },
  *[receivedAppealableRuling](action) {
    const disputeId = action.payload.id;
    const taskId = yield select(selectTaskIdFromDisputeId(disputeId));
    if (!taskId) {
      return;
    }
    const task = yield call(selectTask, { id: taskId });
    if (!task) {
      return;
    }

    const { account, blockNumber } = action.meta;

    if (![task.requester, task.parties[TaskParty.Translator], task.parties[TaskParty.Challenger]].includes(account)) {
      return;
    }

    yield put(
      putNotification({
        id: `${blockNumber}-AppealPossible-${account}-${taskId}`,
        account,
        blockNumber,
        priority: 35,
        data: {
          type: 'warning',
          icon: 'dispute',
          text: 'The juros ruled the dispute. The result can be appealed.',
          url: `/translation/${taskId}`,
        },
      })
    );
  },
  *[disputeAppealed](action) {
    const disputeId = action.payload.id;
    const taskId = yield select(selectTaskIdFromDisputeId(disputeId));
    if (!taskId) {
      return;
    }
    const task = yield call(selectTask, { id: taskId });
    if (!task) {
      return;
    }

    const { account, blockNumber } = action.meta;

    if (![task.requester, task.parties[TaskParty.Translator], task.parties[TaskParty.Challenger]].includes(account)) {
      return;
    }

    yield put(
      putNotification({
        id: `${blockNumber}-AppealDecision-${account}-${taskId}`,
        account,
        blockNumber,
        priority: 36,
        data: {
          type: 'info',
          icon: 'dispute',
          text: 'The dispute has been appealed',
          url: `/translation/${taskId}`,
        },
      })
    );
  },
  *[paidAppealFee](action, { role }) {
    if (role === undefined) {
      return;
    }

    const { id, party } = action.payload;
    const { account, blockNumber } = action.meta;

    if (
      (party === TaskParty.Translator && role === Role.Translator) ||
      (party === TaskParty.Challenger && role === Role.Challenger)
    ) {
      return;
    }

    const partyDescription = {
      [TaskParty.Translator]: 'translator',
      [TaskParty.Challenger]: 'challenger',
    };

    const text = `The ${partyDescription[party]} paid the full appeal fee.`;
    const type = [Role.Translator, Role.Challenger].includes(role) ? 'warning' : 'info';

    yield put(
      putNotification({
        id: `${blockNumber}-HasPaidFee-${account}-${id}`,
        account,
        blockNumber,
        priority: 40,
        data: {
          type,
          text,
          icon: 'bell',
          url: `/translation/${id}`,
        },
      })
    );
  },
  *[taskResolved](action, { role }) {
    if (role === undefined) {
      return;
    }

    const { id } = action.payload;
    const { account, blockNumber } = action.meta;

    let task = yield call(selectTask, { id });

    if (task.status === TaskStatus.Resolved) {
      const notification = yield call(buildFinalResolvedNotification, { id, task, role, account, blockNumber });
      yield put(notification);
    } else {
      const notification = yield call(buildInterimResolvedNotification, { id, task, role, account, blockNumber });
      yield put(notification);

      const MAX_WAIT = 10000; // 10 seconds
      yield race([call(waitForTaskFetch, { id }), delay(MAX_WAIT)]);
      task = yield call(selectTask, { id });

      if (task.status === TaskStatus.Resolved) {
        const notification = yield call(buildFinalResolvedNotification, { id, task, role, account, blockNumber });
        yield put(notification);
      } else {
        try {
          const { data } = yield putResolve(singleTaskActions.fetchById({ id }, { meta: { thunk: { id } } }));
          const notification = yield call(buildFinalResolvedNotification, {
            id,
            task: data,
            role,
            account,
            blockNumber,
          });
          yield put(notification);
        } catch {
          // Ignore the  error
        }
      }
    }
  },
};

function* selectTask({ id }) {
  const task = yield select(state => state.tasks?.entities?.[id]?.data);
  return task;
}

function* waitForTaskFetch({ id }) {
  while (true) {
    const action = yield take(singleTaskActions.fetchById.fulfilled);
    if (action.payload.id === id) {
      return true;
    }
  }
}

function buildInterimResolvedNotification({ task, account, id, blockNumber }) {
  const { hasDispute } = task;

  const text = hasDispute
    ? 'The jurors ruled about this translation task. Getting more details...'
    : 'Translation task was finalized. Getting more details...';

  return putNotification({
    id: `${blockNumber}-TaskResolved-${account}-${id}`,
    account,
    blockNumber,
    priority: 50,
    data: {
      transient: true,
      type: 'info',
      icon: 'bell',
      text,
      url: `/translation/${id}`,
    },
  });
}

function buildFinalResolvedNotification({ task, role, account, id, blockNumber }) {
  const {
    hasDispute,
    ruling,
    parties: { [TaskParty.Requester]: requester, [TaskParty.Challenger]: challenger },
  } = task;
  const challengerIsRequester = requester === challenger;

  let text;
  let type;
  let icon;

  if (hasDispute) {
    const messageByRuling = {
      [DisputeRuling.RefuseToRule]: () => 'Jurors refused to rule about the translation.',
      [DisputeRuling.TranslationApproved]: () => 'Jurors approved the translation.',
      [DisputeRuling.TranslationRejected]: () => 'Jurors rejected the translation.',
    };

    const appendedMessageByRuling = {
      [DisputeRuling.RefuseToRule]: () => {
        const messagesByRole = {
          [Role.Requester]: 'You received your requester deposit back.',
          [Role.Translator]: 'You received your translator deposit back.',
          [Role.Challenger]: challengerIsRequester
            ? 'You received your requester deposit + part of your challenger deposit back.'
            : 'You received part of your challenger deposit back.',
          [Role.Contributor]: '',
        };

        return messagesByRole[role];
      },
      [DisputeRuling.TranslationApproved]: () => {
        const messagesByRole = {
          [Role.Requester]: 'Your requester deposit was sent to the translator.',
          [Role.Translator]:
            'You received your translator deposit back + the challenger deposit + the requester deposit.',
          [Role.Challenger]: challengerIsRequester
            ? 'Your requester deposit + your challenger deposit were sent to the translator.'
            : 'Your challenger deposit was sent to the translator.',
          [Role.Contributor]: '',
        };

        return messagesByRole[role];
      },
      [DisputeRuling.TranslationRejected]: () => {
        const messagesByRole = {
          [Role.Requester]: 'You received your requester deposit back.',
          [Role.Translator]: 'Your translator deposit was sent to the challenger.',
          [Role.Challenger]: challengerIsRequester
            ? 'You received your requester deposit back + the challenger deposit back + the translator deposit.'
            : 'You received your challenger deposit back + the translator deposit.',
          [Role.Contributor]: '',
        };

        return messagesByRole[role];
      },
    };

    text = [messageByRuling[ruling](), appendedMessageByRuling[ruling]()].filter(m => !!m).join(' ');

    const typeByRuling = {
      [DisputeRuling.RefuseToRule]: 'info',
      [DisputeRuling.TranslationApproved]: 'success',
      [DisputeRuling.TranslationRejected]: 'danger',
    };
    type = typeByRuling[DisputeRuling.of(ruling)];

    const iconsByRuling = {
      [DisputeRuling.RefuseToRule]: 'bell',
      [DisputeRuling.TranslationApproved]: 'confirmation',
      [DisputeRuling.TranslationRejected]: 'failure',
    };

    icon = iconsByRuling[DisputeRuling.of(ruling)];
  } else {
    const appendedMessage =
      role === Role.Translator
        ? 'You have received the payment from the requester.'
        : 'The translator received the payment from the requester.';
    text = `The translation task was resolved. ${appendedMessage}`;

    type = 'success';
    icon = 'confirmation';
  }

  return putNotification({
    id: `${blockNumber}-TaskResolved-${account}-${id}`,
    account,
    blockNumber,
    priority: 50,
    data: {
      type,
      icon,
      text,
      url: `/translation/${id}`,
    },
  });
}
