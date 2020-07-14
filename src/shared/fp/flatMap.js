import curry from './curry';

const flatMap = (fn, arr) => (arr ?? []).flatMap(fn);

export default curry(flatMap);
