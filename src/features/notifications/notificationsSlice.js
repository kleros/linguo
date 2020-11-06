import { createSlice } from '@reduxjs/toolkit';
import { original } from 'immer';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    byId: {},
    byAccount: {},
  },
  reducers: {
    markAsRead(state, action) {
      const { id } = action.payload;
      if (state.byId[id]) {
        const accountsForId = state.byId[id].accounts ?? [];
        accountsForId.forEach(account => {
          const idsForAccount = state.byAccount[account].ids;
          if (idsForAccount) {
            const index = idsForAccount.findIndex(currentId => currentId === id);
            if (index > 0) {
              idsForAccount.splice(index, 1);
            }
          }
        });
        delete state.byId[id];
      }
    },
    markAllFromAccountAsRead(state, action) {
      const { account } = action.payload;
      const ids = original(state.byAccount[account]).ids;

      state.byAccount[account].ids = [];

      ids.forEach(id => {
        delete state.byId[id];
      });
    },
    append(state, action) {
      const { id, data, blockNumber, read, account } = action.payload;

      if (account) {
        state.byId[id] = state.byId[id] ?? {};
        state.byId[id].id = id;
        state.byId[id].data = data;
        state.byId[id].blockNumber = blockNumber;
        state.byId[id].read = read ?? false;
        state.byId[id].accounts = state.byId[id].accounts ?? [];
        state.byId[id].accounts.push(account);

        state.byAccount[account] = state.byAccount[account] ?? {};
        state.byAccount[account].ids = [...new Set([...(state.byAccount[account].ids ?? []), id])];
        if (blockNumber > (state.byAccount[account].latestBlock ?? 0)) {
          state.byAccount[account].latestBlock = blockNumber;
        }
      }
    },
  },
});

export default notificationsSlice.reducer;

export const { append, markAsRead, markAllFromAccountAsRead } = notificationsSlice.actions;

const selectAllFiltered = (state, { ids, filter }) =>
  ids.reduce((acc, id) => {
    const notification = state.notifications.byId[id];
    return notification && filter(notification) ? acc.concat(notification) : acc;
  }, []);

export const selectByAccount = (state, { account = null, filter = () => true } = {}) => {
  const ids = state.notifications.byAccount[account]?.ids ?? [];
  return selectAllFiltered(state, { ids, filter });
};

export const selectTotalCountByAccount = (state, { account = null } = {}) => {
  const ids = state.notifications.byAccount[account]?.ids ?? [];
  return ids.length;
};

export const selectLatestBlock = (state, { account = null }) =>
  state.notifications.byAccount[account]?.latestBlock ?? 0;
