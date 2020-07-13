import curry from './curry';

const reduce = (reducer, initialValue, arr) => {
  return arr.reduce(reducer, initialValue);
};

export default curry(reduce);
