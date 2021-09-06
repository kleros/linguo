import produce from 'immer';

export default {
  0: produce(state => {
    state.tasks.filters = {
      status: state.tasks?.filter,
    };

    delete state.tasks?.filter;
  }),
  1: produce(state => {
    state.tasks.byAccount = {};
  }),
};
