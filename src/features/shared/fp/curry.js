const curry = (fn, ...args) =>
  args.length >= fn.length ? fn(...args) : (...next) => curry(fn.bind(fn, ...args), ...next);

export default curry;
