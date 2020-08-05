import produce from 'immer';

export default {
  0: produce(state => {
    delete state.tokens.entities;
    delete state.tokens.all;
  }),
};
