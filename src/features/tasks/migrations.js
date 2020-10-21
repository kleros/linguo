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
};
