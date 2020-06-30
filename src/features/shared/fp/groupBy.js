import curry from './curry';

const groupBy = (getProp, arr) =>
  (arr ?? []).reduce(
    (acc, current) =>
      Object.assign(acc, {
        [getProp(current)]: current,
      }),
    {}
  );

export default curry(groupBy);
