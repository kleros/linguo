import curry from './curry';
import reduce from './reduce';

const omit = (props, obj) =>
  reduce(
    (acc, [key, value]) =>
      !props.includes(key)
        ? Object.assign(acc, {
            [key]: value,
          })
        : acc,
    {},
    Object.entries(obj)
  );

export default curry(omit);
