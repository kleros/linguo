import produce from 'immer';

export default {
  0: produce(state => {
    if (!state.tasks?.secondLevelFilter) {
      state.tasks.secondLevelFilter = {};
    }
  }),
};
