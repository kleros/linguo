import curry from './curry';
import reduce from './reduce';

const groupBy = (getKey, arr) =>
  reduce(
    (acc, current) =>
      Object.assign(acc, {
        [getKey(current)]: current,
      }),
    {},
    arr ?? []
  );

export default curry(groupBy);
