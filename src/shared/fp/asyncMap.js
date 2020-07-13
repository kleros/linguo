import curry from './curry';
import map from './map';

const asyncMap = (fn, arr) => Promise.all(map(fn, arr ?? []));

export default curry(asyncMap);
