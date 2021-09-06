import produce from 'immer';

export default {
  0: produce(state => {
    if (!state.tasks?.secondLevelFilter) {
      state.tasks.secondLevelFilter = {};
    }
  }),
  1: produce(state => {
    delete state.tasks?.filter;
    delete state.tasks?.secondLevelFilter;

    state.tasks.filters = {};
  }),
  2: produce(state => {
    state.tasks.byAccount = {};
  }),
};
