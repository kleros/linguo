const compose2 = (f, g) => (...args) => f(g(...args));

const compose = (...fns) => fns.reduceRight(compose2);

export default compose;
