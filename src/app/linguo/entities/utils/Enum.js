const identity = x => x;

const Enum = (name, options, { parseValue = identity } = {}) =>
  Object.assign(
    Object.create(Object.prototype, {
      of: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function of(value) {
          const parsedValue = parseValue(value);

          if (!Object.values(this).includes(parsedValue)) {
            throw new Error(`Invalid ${name} value: ${value}`);
          }

          return parsedValue;
        },
      },
      toString: {
        value: function toString() {
          return `${name} #{ ${Object.entries(this)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')} }`;
        },
      },
    }),
    options
  );

export default Enum;
