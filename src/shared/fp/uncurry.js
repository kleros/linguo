const uncurry = curriedFn => (...args) => args.reduce((left, right) => left(right), curriedFn);

export default uncurry;
