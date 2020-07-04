import curry from './curry';

const pick = (props, obj) =>
  props.reduce(
    (acc, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop)
        ? Object.assign(acc, {
            [prop]: obj[prop],
          })
        : acc,
    {}
  );

export default curry(pick);
