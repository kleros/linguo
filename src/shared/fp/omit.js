import curry from './curry';
import reduce from './reduce';

const omit = (props, obj) =>
  reduce(
    (acc, prop) =>
      !Object.prototype.hasOwnProperty.call(obj, prop)
        ? Object.assign(acc, {
            [prop]: obj[prop],
          })
        : acc,
    {},
    props
  );

export default curry(omit);
