const curry = (fn, ...args) => {
  if (args.length >= fn.length) {
    return fn(...args);
  }

  const curried = (...next) => curry(fn.bind(fn, ...args), ...next);
  return Object.defineProperty(curried, 'name', {
    value: `${fn.displayName || fn.name}`,
  });
};

export default curry;
