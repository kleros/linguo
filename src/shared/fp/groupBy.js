import curry from './curry';
import reduce from './reduce';

const groupBy = (getKey, arr) =>
  reduce(
    (acc, current) => {
      const key = getKey(current);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(current);

      return acc;
    },
    {},
    arr ?? []
  );

export default curry(groupBy);
