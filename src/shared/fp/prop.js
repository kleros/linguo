import curry from './curry';

const prop = (propName, obj) => obj?.[propName];

export default curry(prop);
