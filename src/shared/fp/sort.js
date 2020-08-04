import curry from './curry';

const sort = (comparatorOrOrder, arr) => {
  const comparator = typeof comparatorOrOrder === 'number' ? createComparator(comparatorOrOrder) : comparatorOrOrder;
  return [...arr].sort(comparator);
};

const createComparator = order => (a, b) => order * (b - a);

export default curry(sort);
