import produce from 'immer';

export default {
  0: produce(state => {
    state.tasks.entities = {};
  }),
  1: produce(state => {
    state.tasks.loadingState = 'idle';
    state.tasks.error = null;
    state.tasks.entities = {};
    state.tasks.ids = [];
  }),
  2: produce(state => {
    Object.entries(state.notifications?.byChainId ?? {}).forEach(([chainId, dataByChainId]) => {
      Object.entries(dataByChainId?.byAccount ?? {}).forEach(([account, dataByAccount]) => {
        const latestBlock = dataByAccount.latestBlock ?? 0;

        state.tasks.byAccount[account].meta.byChainId[chainId] =
          state.tasks.byAccount[account].meta.byChainId[chainId] ?? {};
        state.tasks.byAccount[account].meta.byChainId[chainId].latestBlock = latestBlock;

        delete state.notifications?.byChainId[chainId].byAccount[account].latestBlock;
      });
    });
  }),
};
