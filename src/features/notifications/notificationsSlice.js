import { createSlice } from '@reduxjs/toolkit';
import { persistReducer, createMigrate } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import migrations from './migrations';

const PERSISTANCE_KEY = 'notifications';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    storage,
    migrate: createMigrate(migrations, { debug: process.env.NODE_ENV !== 'production' }),
    version: 1,
  };

  return persistReducer(persistConfig, reducer);
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    byChainId: {},
  },
  reducers: {
    markAsRead(state, action) {
      const { chainId, id } = action.payload;
      if (state.byChainId[chainId]?.byId?.[id]) {
        const accountsForId = state.byChainId[chainId].byId[id].accounts ?? [];
        accountsForId.forEach(account => {
          const idsForAccount = state.byChainId[chainId].byAccount[account].ids;
          if (idsForAccount) {
            const index = idsForAccount.findIndex(currentId => currentId === id);
            if (index > 0) {
              idsForAccount.splice(index, 1);
            }
          }
        });
        delete state.byChainId[chainId].byId[id];
      }
    },
    markAllFromAccountAsRead(state, action) {
      const { chainId, account } = action.payload;
      const ids = state.byAccount[account].ids;

      if (state.byChainId[chainId]?.byAccount?.[account]) {
        state.byChainId[chainId].byAccount[account].ids = [];

        ids.forEach(id => {
          delete state.byId[id];
        });
      }
    },
    put(state, action) {
      const { chainId, account, id, data, blockNumber, priority, read } = action.payload;

      if (chainId && account) {
        state.byChainId[chainId] = state.byChainId[chainId] ?? {
          byAccount: {},
          byId: {},
        };
        state.byChainId[chainId].byId[id] = state.byChainId[chainId].byId[id] ?? {};
        state.byChainId[chainId].byId[id].id = id;
        state.byChainId[chainId].byId[id].data = data;
        state.byChainId[chainId].byId[id].blockNumber = blockNumber;
        state.byChainId[chainId].byId[id].priority = priority;
        state.byChainId[chainId].byId[id].read = read ?? false;
        state.byChainId[chainId].byId[id].accounts = state.byChainId[chainId].byId[id].accounts ?? [];
        state.byChainId[chainId].byId[id].accounts.push(account);

        state.byChainId[chainId].byAccount[account] = state.byChainId[chainId].byAccount[account] ?? {};
        state.byChainId[chainId].byAccount[account].ids = [
          ...new Set([...(state.byChainId[chainId].byAccount[account].ids ?? []), id]),
        ];
        if (blockNumber > (state.byChainId[chainId].byAccount[account].latestBlock ?? 0)) {
          state.byChainId[chainId].byAccount[account].latestBlock = blockNumber;
        }
      }
    },
  },
});

export default createPersistedReducer(notificationsSlice.reducer);

export const { put, markAsRead, markAllFromAccountAsRead } = notificationsSlice.actions;

const selectAllFiltered = (state, { chainId, ids, filter }) =>
  ids.reduce((acc, id) => {
    const notification = state.notifications?.byChainId[chainId]?.byId[id];
    return notification && filter(notification) ? acc.concat(notification) : acc;
  }, []);

export const selectByAccount = (state, { chainId, account = null, filter = () => true } = {}) => {
  const ids = state.notifications.byChainId[chainId]?.byAccount[account]?.ids ?? [];
  return selectAllFiltered(state, { chainId, ids, filter });
};

export const selectTotalCountByAccount = (state, { chainId, account = null } = {}) => {
  const ids = state.notifications.byChainId[chainId]?.byAccount[account]?.ids ?? [];
  return ids.length;
};

export const selectLatestBlock = (state, { chainId, account = null }) =>
  state.notifications.byChainId[chainId]?.byAccount[account]?.latestBlock ?? 0;
