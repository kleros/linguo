const compose2 = (g, f) => (...args) => f(g(...args));

const compose = (...fns) => fns.reduceRight(compose2);

export default compose;
