import curry from './curry';

const groupBy = (getKey, arr) =>
  (arr ?? []).reduce(
    (acc, current) =>
      Object.assign(acc, {
        [getKey(current)]: current,
      }),
    {}
  );

export default curry(groupBy);
