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
import {
  put as putNotification,
  selectByAccount as selectNotificationsByAccount,
} from '~/features/notifications/notificationsSlice';
import { selectTaskIdFromDisputeId } from '~/features/disputes/disputesSlice';
import createCancelableSaga from '~/shared/createCancelableSaga';
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
const updateTransientNotifications = createAction('tasks/updates/updateTransientNotifications', prepare);

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

    builder.addMatcher(
      action =>
        [
          taskAssigned.match(action),
          taskCreated.match(action),
          taskResolved.match(action),
          translationChallenged.match(action),
          receivedAppealableRuling.match(action),
          appealContribution.match(action),
          paidAppealFee.match(action),
          disputeAppealed.match(action),
          translationSubmitted.match(action),
        ].some(x => !!x),
      (state, action) => {
        const { account, blockNumber, chainId } = action.meta;
        state.byAccount[account] = state.byAccount[account] ?? {};
        state.byAccount[account].meta = state.byAccount[account].meta ?? { byChainId: {} };

        if (blockNumber > (state.byAccount[account].meta.byChainId[chainId]?.latestBlock ?? 0)) {
          state.byAccount[account].meta.byChainId[chainId] = state.byAccount[account].meta.byChainId[chainId] ?? {};
          state.byAccount[account].meta.byChainId[chainId].latestBlock = blockNumber;
        }
      }
    );
  },
});

export default taskUpdatesSlice.reducer;

export const actions = {
  subscribeToUpdates,
  unsubscribeFromUpdates,
  updateTransientNotifications,
  taskCreated,
  taskAssigned,
  translationSubmitted,
  translationChallenged,
  appealContribution,
  paidAppealFee,
  taskResolved,
  ...taskUpdatesSlice.actions,
};

export const selectors = {
  selectLatestBlock: (state, { account, chainId }) =>
    state.byAccount[account]?.meta?.byChainId?.[chainId]?.latestBlock ?? 0,
};

const MAX_BLOCKS_TO_SUBSCRIBE = 4 * 60 * 24 * 60; // ~60 days worth of blocks

export function* subscribeSaga(action) {
  const [linguoApi, web3] = yield all([getContext('linguoApi'), getContext('web3')]);

  const currentBlock = yield call([web3.eth, 'getBlockNumber']);

  const { fromBlock, filter, chainId, account } = action.payload ?? {};
  const actualFromBlock = Math.max(fromBlock, currentBlock - MAX_BLOCKS_TO_SUBSCRIBE);

  const [subscriptions, arbitratorSubscriptions] = yield all([
    call([linguoApi, 'subscribe'], { fromBlock: actualFromBlock, filter }),
    call([linguoApi, 'subscribeToArbitrator'], { fromBlock: actualFromBlock, filter }),
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
          chainId,
        },
      };
      yield put(preparedEvent);
      yield fork(makeNotificationsFromUpdates, preparedEvent);
    }
  } finally {
    if (yield cancelled()) {
      chan.close();
    }
  }
}

export function* updateTransientResolvedNotificationsSaga(action) {
  const { account, chainId } = action.payload;

  const transientNotifications = yield select(state =>
    selectNotificationsByAccount(state, {
      account,
      chainId,
      filter: notification => {
        return /-TaskResolved-/.test(notification.id) && notification.data?.transient === true;
      },
    })
  );

  yield all(
    transientNotifications.map(function* processTransientNotification({ id: notificationId }) {
      const [blockNumber, __, ___, taskId] = notificationId.split('-');
      const role = yield call(selectRole, { account, id: taskId });

      const { data } = yield putResolve(
        singleTaskActions.fetchById({ id: taskId }, { meta: { thunk: { id: taskId } } })
      );

      const notification = yield call(makeFinalResolvedNotification, {
        id: taskId,
        task: data,
        role,
        chainId,
        account,
        blockNumber,
      });
      yield put(notification);
    })
  );
}

const createWatchSubscribe = createWatcherSaga(
  { takeType: TakeType.every },
  createCancelableSaga(subscribeSaga, unsubscribeFromUpdates)
);

const createWatchUpdateTransientResolvedNotifications = createWatcherSaga(
  { takeType: TakeType.every },
  updateTransientResolvedNotificationsSaga
);

export const sagaDescriptors = [
  [createWatchSubscribe, actionChannel(subscribeToUpdates.type)],
  [createWatchUpdateTransientResolvedNotifications, actionChannel(updateTransientNotifications.type)],
];

function* makeNotificationsFromUpdates(action) {
  const { id } = action.payload;
  const { account } = action.meta;
  const role = yield call(selectRole, { id, account });

  const handler = notificationMakersByType[action.type];
  if (handler) {
    yield fork(handler, action, { role });
  }
}

const Role = {
  Requester: 'requester',
  Translator: 'translator',
  Challenger: 'challenger',
  Contributor: 'contributor',
  Other: 'other',
};

const notificationMakersByType = {
  *[taskAssigned](action, { role }) {
    if (role !== Role.Requester) {
      return;
    }

    const { id } = action.payload;
    const { chainId, account, blockNumber } = action.meta;

    yield put(
      putNotification({
        id: `${blockNumber}-TaskAssigned-${account}-${id}`,
        chainId,
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
    const { chainId, account, blockNumber } = action.meta;

    yield put(
      putNotification({
        id: `${blockNumber}-TranslationSubmitted-${account}-${id}`,
        chainId,
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
    const { chainId, account, blockNumber } = action.meta;

    yield put(
      putNotification({
        id: `${blockNumber}-TranslationChallenged-${account}-${id}`,
        account,
        chainId,
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
  *[receivedAppealableRuling](action, { chainId }) {
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
        chainId,
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
  *[disputeAppealed](action, { chainId }) {
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
        chainId,
        account,
        blockNumber,
        priority: 36,
        data: {
          type: 'warning',
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
    const { chainId, account, blockNumber } = action.meta;

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
        chainId,
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
    const { chainId, account, blockNumber } = action.meta;

    let task = yield call(selectTask, { id });
    if (!task) {
      return;
    }

    if (task.status === TaskStatus.Resolved) {
      const notification = yield call(makeFinalResolvedNotification, {
        id,
        task,
        role,
        chainId,
        account,
        blockNumber,
      });
      yield put(notification);
    } else {
      const notification = yield call(makeTransientResolvedNotification, {
        id,
        task,
        role,
        chainId,
        account,
        blockNumber,
      });
      yield put(notification);

      const MAX_WAIT = 10000; // 10 seconds
      yield race([call(waitForTaskFetch, { id }), delay(MAX_WAIT)]);
      task = yield call(selectTask, { id });
      if (!task) {
        return;
      }

      if (task.status === TaskStatus.Resolved) {
        const notification = yield call(makeFinalResolvedNotification, {
          id,
          task,
          role,
          chainId,
          account,
          blockNumber,
        });
        yield put(notification);
      } else {
        try {
          const { data } = yield putResolve(singleTaskActions.fetchById({ id }, { meta: { thunk: { id } } }));
          const notification = yield call(makeFinalResolvedNotification, {
            id,
            task: data,
            role,
            chainId,
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

function* selectRole({ id, account }) {
  const role = yield select(state => state.tasks.updates.byAccount[account]?.[id]?.role);
  return role;
}

function* waitForTaskFetch({ id }) {
  while (true) {
    const action = yield take(singleTaskActions.fetchById.fulfilled);
    if (action.payload.id === id) {
      return true;
    }
  }
}

function makeTransientResolvedNotification({ task, chainId, account, id, blockNumber }) {
  const { hasDispute } = task;

  const text = hasDispute
    ? 'The dispute about the translation task is over. Getting more details...'
    : 'The translation task was resolved. Getting more details...';

  return putNotification({
    id: `${blockNumber}-TaskResolved-${account}-${id}`,
    chainId,
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

function makeFinalResolvedNotification({ task, role, chainId, account, id, blockNumber }) {
  const {
    hasDispute,
    ruling,
    parties: {
      [TaskParty.Requester]: requester,
      [TaskParty.Translator]: translator,
      [TaskParty.Challenger]: challenger,
    },
  } = task;

  let text;
  let type;
  let icon;

  if (!translator) {
    text = 'No translator was assigned to the task before the deadline.';
    type = 'warning';
    icon = 'bell';
  } else if (!task.translatedTextUrl) {
    const appendedMessageByRole = {
      [Role.Requester]: 'You received the escrow deposit back + the translator deposit.',
      [Role.Translator]: 'Your translator deposit was sent to the requester.',
    };

    text = `The translation was not delivered in time. ${appendedMessageByRole[role]}`;
    type = role === Role.Translator ? 'danger' : 'info';
    icon = 'bell';
  } else if (hasDispute) {
    const challengerIsRequester = requester === challenger;

    const messageByRuling = {
      [DisputeRuling.RefuseToRule]: () => 'Jurors refused to rule about the translation.',
      [DisputeRuling.TranslationApproved]: () => 'Jurors approved the translation.',
      [DisputeRuling.TranslationRejected]: () => 'Jurors rejected the translation.',
    };

    const appendedMessageByRuling = {
      [DisputeRuling.RefuseToRule]: () => {
        const messagesByRole = {
          [Role.Requester]: 'You received the bounty back.',
          [Role.Translator]: 'You received your translator deposit back.',
          [Role.Challenger]: challengerIsRequester
            ? 'You received the bounty + part of your challenger deposit back.'
            : 'You received part of your challenger deposit back.',
          [Role.Contributor]: '',
        };

        return messagesByRole[role];
      },
      [DisputeRuling.TranslationApproved]: () => {
        const messagesByRole = {
          [Role.Requester]: 'The bounty was sent to the translator.',
          [Role.Translator]: 'You received your translator deposit back + the challenger deposit + the bounty.',
          [Role.Challenger]: challengerIsRequester
            ? 'The bounty + your challenger deposit were sent to the translator.'
            : 'Your challenger deposit was sent to the translator.',
          [Role.Contributor]: '',
        };

        return messagesByRole[role];
      },
      [DisputeRuling.TranslationRejected]: () => {
        const messagesByRole = {
          [Role.Requester]: 'You received the bounty back.',
          [Role.Translator]: 'Your translator deposit was sent to the challenger.',
          [Role.Challenger]: challengerIsRequester
            ? 'You received the bounty back + the challenger deposit back + the translator deposit.'
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
    const appendedMessagesByRole = {
      [Role.Requester]: 'The bounty was sent to the translator.',
      [Role.Translator]: 'You have received your translator deposit back + the payment from the requester.',
      [Role.Other]: 'The translator received the escrow payment.',
    };

    text = `The translation task was completed. ${appendedMessagesByRole[role]}`;

    type = 'success';
    icon = 'confirmation';
  }

  return putNotification({
    id: `${blockNumber}-TaskResolved-${account}-${id}`,
    chainId,
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
