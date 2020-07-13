import curry from './curry';

const asyncMapValues = async (fn, obj) => {
  const promises = Object.entries(obj).map(async ([key, value], index, arr) => [key, await fn(value, index, arr)]);

  return Object.fromEntries(await Promise.all(promises));
};

export default curry(asyncMapValues);
