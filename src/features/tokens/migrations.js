import produce from 'immer';

export default {
  0: produce(state => {
    delete state.tokens.entities;
    delete state.tokens.all;
  }),
  1: produce(state => {
    state.tokens.supported = {
      byChainId: {
        ...state.tokens.byChainId,
      },
    };

    state.tokens.others = {
      byChainId: {
        42: {},
        1: {},
      },
    };

    delete state.tokens.byChainId;
  }),
};
