import curry from './curry';

const propOr = (propName, defaultValue, obj) => obj?.[propName] ?? defaultValue;

export default curry(propOr);
