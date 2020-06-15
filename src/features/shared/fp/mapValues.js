import curry from './curry';

const mapValues = (fn, obj) =>
  Object.entries(obj).reduce(
    (acc, [key, value]) =>
      Object.assign(acc, {
        [key]: fn(value, key, obj),
      }),
    {}
  );

export default curry(mapValues);
