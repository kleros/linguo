import curry from './curry';

const flattenLimit = (depth, arr) => (arr ?? []).flat(depth);

export default curry(flattenLimit);
