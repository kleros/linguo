import produce from 'immer';

export default {
  0: produce(state => {
    if (state?.notifications?.byAccount) {
      state.notifications.byChainId = state.notifications.byChainId ?? {};
      state.notifications.byChainId[42] = state.notifications.byChainId[42] ?? {};
      state.notifications.byChainId[42].byAccount = { ...state.notifications.byAccount };
      state.notifications.byChainId[42].byId = { ...state.notifications.byId };

      delete state.notifications.byAccount;
      delete state.notifications.byId;
    }
  }),
};
