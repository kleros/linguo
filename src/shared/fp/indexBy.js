import curry from './curry';
import reduce from './reduce';

const indexBy = (getKey, arr) =>
  reduce(
    (acc, current) =>
      Object.assign(acc, {
        [getKey(current)]: current,
      }),
    {},
    arr ?? []
  );

export default curry(indexBy);
