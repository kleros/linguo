import curry from './curry';

const map = (fn, arr) => (arr ?? []).map(fn);

export default curry(map);
